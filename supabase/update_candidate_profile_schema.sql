-- =====================================================================
-- MIGRASI DATABASE SUPABASE: PROFIL KANDIDAT KOMPREHENSIF (MAGANGHUB STANDARD)
-- 
-- Jalankan skrip ini di SQL Editor Supabase untuk menambahkan kolom & tabel baru.
-- =====================================================================

-- 1. Tambahkan Kolom Baru pada Tabel Profiles (jika belum ada)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nik TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;

-- 2. Buat Tabel Relasional Educations
CREATE TABLE IF NOT EXISTS public.educations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  level TEXT NOT NULL,
  school TEXT NOT NULL,
  major TEXT NOT NULL,
  gpa TEXT,
  start_year TEXT NOT NULL,
  end_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Buat Tabel Relasional Certifications
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_year TEXT NOT NULL,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Buat Tabel Relasional Experiences
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  period TEXT,
  start_month TEXT,
  start_year TEXT,
  end_month TEXT,
  end_year TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Buat Tabel Relasional Skills
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Aktifkan RLS dan Buat Kebijakan Keamanan
ALTER TABLE public.educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own educations" ON public.educations;
CREATE POLICY "Users manage own educations" ON public.educations FOR ALL USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users manage own certifications" ON public.certifications;
CREATE POLICY "Users manage own certifications" ON public.certifications FOR ALL USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users manage own experiences" ON public.experiences;
CREATE POLICY "Users manage own experiences" ON public.experiences FOR ALL USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users manage own skills" ON public.skills;
CREATE POLICY "Users manage own skills" ON public.skills FOR ALL USING (auth.uid() = user_id OR auth.role() = 'authenticated');
