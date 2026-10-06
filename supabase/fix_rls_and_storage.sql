-- =====================================================================
-- FIX SCRIPT: CV Upload & Profile Persistence
-- JALANKAN INI DI: Supabase Dashboard > SQL Editor
-- 
-- Penyebab utama CV hilang setelah refresh:
-- 1. Tidak ada INSERT policy di tabel profiles -> upsert gagal diam-diam
-- 2. Bucket 'resumes' mungkin belum Public atau tidak ada storage policy
-- =====================================================================

-- -----------------------------------------------------------------------
-- BAGIAN 1: FIX RLS POLICY PADA TABEL profiles
-- Tambahkan policy INSERT agar upsert bisa bekerja untuk user baru
-- -----------------------------------------------------------------------

-- Policy: Kandidat bisa INSERT profil baru (diperlukan untuk upsert)
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Kandidat bisa UPDATE profil sendiri  
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Kandidat bisa membaca profil sendiri
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Admin/Recruiter bisa membaca semua profil
DROP POLICY IF EXISTS "Admin/Recruiter read profiles" ON public.profiles;
CREATE POLICY "Admin/Recruiter read profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Admin/Recruiter bisa UPDATE semua profil (untuk pipeline rekrutmen)
DROP POLICY IF EXISTS "Admin/Recruiter update profiles" ON public.profiles;
CREATE POLICY "Admin/Recruiter update profiles" ON public.profiles
  FOR UPDATE USING (auth.role() = 'authenticated');


-- -----------------------------------------------------------------------
-- BAGIAN 2: TRIGGER OTOMATIS BUAT PROFIL SAAT USER BARU REGISTER
-- Ini memastikan row profiles langsung dibuat saat user mendaftar,
-- sehingga upsert berikutnya selalu UPDATE (bukan INSERT)
-- -----------------------------------------------------------------------

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
  ON CONFLICT (id) DO NOTHING; -- Jangan overwrite jika sudah ada
  RETURN NEW;
END;
$$;

-- Pasang trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- -----------------------------------------------------------------------
-- BAGIAN 3: PASTIKAN SEMUA USER YANG ADA SUDAH PUNYA ROW DI profiles
-- Jalankan sekali untuk backfill data user yang sudah register sebelumnya
-- -----------------------------------------------------------------------

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


-- -----------------------------------------------------------------------
-- BAGIAN 4: SUPABASE STORAGE - POLICY BUCKET 'resumes'
-- -----------------------------------------------------------------------
-- PENTING: Pastikan bucket 'resumes' sudah dibuat dan diset PUBLIK
-- di Dashboard Supabase > Storage > Buckets > resumes > Make Public
--
-- Storage policies (jalankan jika bucket belum ada policynya):

INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES ('resumes', 'resumes', true, ARRAY['application/pdf'], 2097152) -- 2MB
ON CONFLICT (id) DO UPDATE SET
  public = true,
  allowed_mime_types = ARRAY['application/pdf'],
  file_size_limit = 2097152;

-- Policy storage: Kandidat bisa upload ke folder user ID mereka sendiri
DROP POLICY IF EXISTS "Authenticated users upload resumes" ON storage.objects;
CREATE POLICY "Authenticated users upload resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy storage: Semua orang bisa membaca/download CV (public view)
DROP POLICY IF EXISTS "Public read resumes" ON storage.objects;
CREATE POLICY "Public read resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes');

-- Policy storage: Kandidat bisa menghapus CV milik mereka sendiri
DROP POLICY IF EXISTS "Users delete own resume" ON storage.objects;
CREATE POLICY "Users delete own resume" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy storage: Kandidat bisa menimpa (upsert/update) CV mereka
DROP POLICY IF EXISTS "Users update own resume" ON storage.objects;
CREATE POLICY "Users update own resume" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- SELESAI! Setelah menjalankan script ini, coba upload CV kembali.
-- CV akan tersimpan permanen dan tidak akan hilang saat refresh.
-- =====================================================================
