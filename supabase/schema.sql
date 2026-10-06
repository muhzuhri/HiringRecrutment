-- =====================================================================
-- SUPABASE DATABASE SCHEMA FOR TALENTHUB / HIRING RECRUITMENT SYSTEM
-- AREA KANDIDAT & SYSTEM RECRUITMENT TRACKING (WITH ADMIN MODULE)
-- =====================================================================

-- 1. TABEL PROFILES (Extended untuk Kandidat & HR Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter', 'admin')),
  education JSONB DEFAULT '[]'::jsonb,
  skills TEXT[] DEFAULT '{}'::text[],
  experience JSONB DEFAULT '[]'::jsonb,
  resume_url TEXT,
  resume_name TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL JOBS (Lowongan Pekerjaan HR)
CREATE TABLE IF NOT EXISTS public.jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  dept TEXT NOT NULL,
  type TEXT DEFAULT 'Full-time',
  location TEXT DEFAULT 'Jakarta, Hybrid',
  salary TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Closed')),
  description TEXT,
  min_education TEXT DEFAULT 'S1' CHECK (min_education IN ('SMA', 'D3', 'S1', 'S2', 'S3')),
  required_skills TEXT[] DEFAULT '{}'::text[],
  posted_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  deadline_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL APPLICATIONS (Lamaran Pekerjaan Kandidat)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  department TEXT NOT NULL,
  job_type TEXT DEFAULT 'Full-time',
  location TEXT DEFAULT 'Jakarta, Indonesia',
  salary TEXT,
  status TEXT CHECK (status IN ('Applied', 'In Review', 'Interview', 'Offered', 'Rejected', 'Hired')) DEFAULT 'Applied',
  current_stage_index INT DEFAULT 1 CHECK (current_stage_index BETWEEN 1 AND 4),
  hr_notes TEXT,
  interview_date TIMESTAMPTZ,
  interview_link TEXT,
  auto_tags TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL INTERNAL_NOTES (Catatan Diskusi Rahasia HR)
CREATE TABLE IF NOT EXISTS public.internal_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABEL AUDIT_LOGS (Log Riwayat Perubahan Status Rekrutmen)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by_name TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ENABLING ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies Profiles
CREATE POLICY "Pengguna membaca profil sendiri" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Pengguna edit profil sendiri" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies Jobs
CREATE POLICY "Semua orang dapat membaca jobs aktif" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Admin dapat membuat & edit jobs" ON public.jobs FOR ALL USING (auth.role() = 'authenticated');

-- Policies Applications
CREATE POLICY "Kandidat membaca lamaran sendiri" ON public.applications FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Kandidat membuat lamaran" ON public.applications FOR INSERT WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Admin/HR membaca seluruh lamaran" ON public.applications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin/HR update status lamaran" ON public.applications FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies Internal Notes & Audit Logs (Admin Only)
CREATE POLICY "Admin mengelola catatan internal" ON public.internal_notes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin membaca audit logs" ON public.audit_logs FOR ALL USING (auth.role() = 'authenticated');

-- 7. SUPABASE STORAGE BUCKET FOR CV PDF
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "User authenticated upload resume PDF" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');
CREATE POLICY "User authenticated read resume PDF" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');
