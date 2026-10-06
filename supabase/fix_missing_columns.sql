-- =====================================================================
-- FIX: Tambah kolom yang hilang di tabel profiles
-- Jalankan di: Supabase Dashboard > SQL Editor
-- =====================================================================

-- Tambah kolom resume_url jika belum ada
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS resume_url TEXT,
  ADD COLUMN IF NOT EXISTS resume_name TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Pastikan INSERT policy ada agar upsert bisa bekerja
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Update policy dengan WITH CHECK agar lebih aman
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger otomatis buat profil saat user baru register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'candidate',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill: pastikan semua user yang sudah ada punya row di profiles
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'candidate',
  NOW(),
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- Storage bucket 'resumes'
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES ('resumes', 'resumes', true, ARRAY['application/pdf'], 2097152)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  allowed_mime_types = ARRAY['application/pdf'],
  file_size_limit = 2097152;

-- Storage policies
DROP POLICY IF EXISTS "Authenticated users upload resumes" ON storage.objects;
CREATE POLICY "Authenticated users upload resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Public read resumes" ON storage.objects;
CREATE POLICY "Public read resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Users delete own resume" ON storage.objects;
CREATE POLICY "Users delete own resume" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resumes' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users update own resume" ON storage.objects;
CREATE POLICY "Users update own resume" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'resumes' AND auth.role() = 'authenticated'
  );

-- Notify Supabase to reload schema cache
NOTIFY pgrst, 'reload schema';

-- =====================================================================
-- SELESAI. Coba upload CV kembali setelah menjalankan script ini.
-- =====================================================================
