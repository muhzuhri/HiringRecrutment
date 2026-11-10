-- =====================================================================
-- SUPABASE COMPLETE DATABASE SCHEMA & SEED DATA (IDEMPOTENT / SAFE RE-RUN)
-- SYSTEM: END-TO-END RECRUITMENT TRACKING SYSTEM (MAGANGHUB STANDARD)
-- 
-- Petunjuk Penggunaan:
-- 1. Buka Dashboard Supabase milik Anda (https://supabase.com/dashboard)
-- 2. Masuk ke menu "SQL Editor"
-- 3. Copy & paste seluruh isi skrip SQL ini lalu klik tombol "Run"
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABEL PROFILES (Kandidat, Recruiter, Admin, Interviewer)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  nik TEXT, -- NIK / Nomor Identitas (Opsional)
  phone TEXT,
  whatsapp TEXT, -- Nomor WhatsApp Aktif
  address TEXT, -- Alamat Domisili Lengkap
  linkedin_url TEXT,
  github_url TEXT, -- Tautan Profil GitHub
  portfolio_url TEXT, -- Portofolio web
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter', 'admin', 'interviewer')),
  education JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb, -- Sertifikasi & Pelatihan
  skills TEXT[] DEFAULT '{}'::text[],
  experience JSONB DEFAULT '[]'::jsonb,
  resume_url TEXT,
  resume_name TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migrasi tambahan jika kolom belum ada pada tabel profiles yang sudah ada
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nik TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('candidate', 'recruiter', 'admin', 'interviewer'));

-- ---------------------------------------------------------------------
-- 1B. TABEL RELASIONAL PENDIDIKAN (EDUCATIONS)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.educations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  level TEXT NOT NULL, -- SMA/SMK, D3, S1, S2, S3
  school TEXT NOT NULL,
  major TEXT NOT NULL,
  gpa TEXT,
  start_year TEXT NOT NULL,
  end_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 1C. TABEL RELASIONAL SERTIFIKASI (CERTIFICATIONS)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_year TEXT NOT NULL,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 1D. TABEL RELASIONAL PENGALAMAN KERJA / MAGANG (EXPERIENCES)
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 1E. TABEL RELASIONAL KEAHLIAN / SKILLS (SKILLS)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 2. TABEL JOBS (Lowongan Pekerjaan Internal HR - CASE 1)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  dept TEXT NOT NULL, -- Divisi / Departemen
  type TEXT DEFAULT 'Hybrid' CHECK (type IN ('WFH', 'WFO', 'Hybrid', 'Full-time', 'Contract', 'Part-time')), -- Tipe Kerja
  location TEXT DEFAULT 'Jakarta, Indonesia',
  salary TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Closed')), -- Status Publikasi
  description TEXT,
  min_education TEXT DEFAULT 'S1' CHECK (min_education IN ('SMA', 'D3', 'S1', 'S2', 'S3')),
  required_skills TEXT[] DEFAULT '{}'::text[], -- Kualifikasi / Skill Required
  posted_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  deadline_date TIMESTAMPTZ, -- Batas Akhir
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 3. TABEL APPLICATIONS (Lamaran Pekerjaan Kandidat - CASE 1, 2, 3)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id TEXT REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT NOT NULL,
  department TEXT NOT NULL,
  job_type TEXT DEFAULT 'Hybrid',
  location TEXT DEFAULT 'Jakarta, Indonesia',
  salary TEXT,
  status TEXT CHECK (status IN ('Diajukan', 'Diproses', 'Interview', 'Diterima', 'Ditolak', 'Applied', 'In Review', 'Offered', 'Rejected', 'Hired')) DEFAULT 'Diajukan',
  current_stage_index INT DEFAULT 1 CHECK (current_stage_index BETWEEN 1 AND 4),
  is_qualified BOOLEAN DEFAULT FALSE, -- Qualified Candidate Flag
  hr_notes TEXT, -- Public candidate instruction notes
  interview_date TIMESTAMPTZ,
  interview_link TEXT,
  hired_at TIMESTAMPTZ, -- Digunakan untuk kalkulasi Time-to-Hire Analytics
  auto_tags TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- CASE 1 RULE: 1 Kandidat hanya boleh 1 lamaran aktif per lowongan
  CONSTRAINT unique_candidate_per_job UNIQUE (candidate_id, job_id)
);

-- ---------------------------------------------------------------------
-- 4. TABEL ASSESSMENTS_AND_INTERVIEWS (Multi-stage Selection CASE 2)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessments_and_interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Psikotes', 'Technical Test', 'Aptitude Test', 'Personality Test', 'Interview HR', 'Interview User')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  evaluator_id UUID REFERENCES auth.users(id), -- Evaluator / Penilai yang ditugaskan
  evaluator_name TEXT NOT NULL,
  score NUMERIC(5,2) CHECK (score IS NULL OR (score >= 0 AND score <= 100)), -- Skala 0-100, NULL = Belum Dinilai (membedakan 0 vs NULL)
  notes TEXT, -- Catatan Evaluasi Penilai
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 5. TABEL INTERNAL_NOTES (Catatan Diskusi Rahasia HR - Confidential CASE 3)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.internal_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 6. TABEL AUDIT_LOGS (Audit Trail Perubahan Status Kronologis CASE 3)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  stage_detail TEXT,
  changed_by_name TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 7. TABEL NOTIFICATIONS (Sistem Notifikasi Kandidat & HR - CASE 1 & BAB 6)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'application_update')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) & IDEMPOTENT RESTRICTION POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments_and_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies Profiles
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin/Recruiter read profiles" ON public.profiles;
CREATE POLICY "Admin/Recruiter read profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

-- Policies Relational Tables (Educations, Certifications, Experiences, Skills)
DROP POLICY IF EXISTS "Users manage own educations" ON public.educations;
CREATE POLICY "Users manage own educations" ON public.educations FOR ALL USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users manage own certifications" ON public.certifications;
CREATE POLICY "Users manage own certifications" ON public.certifications FOR ALL USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users manage own experiences" ON public.experiences;
CREATE POLICY "Users manage own experiences" ON public.experiences FOR ALL USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users manage own skills" ON public.skills;
CREATE POLICY "Users manage own skills" ON public.skills FOR ALL USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Policies Jobs
DROP POLICY IF EXISTS "Public & Candidates read active jobs" ON public.jobs;
CREATE POLICY "Public & Candidates read active jobs" ON public.jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin create & edit jobs" ON public.jobs;
CREATE POLICY "Admin create & edit jobs" ON public.jobs FOR ALL USING (auth.role() = 'authenticated');

-- Policies Applications
DROP POLICY IF EXISTS "Candidates read own applications" ON public.applications;
CREATE POLICY "Candidates read own applications" ON public.applications FOR SELECT USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates insert application" ON public.applications;
CREATE POLICY "Candidates insert application" ON public.applications FOR INSERT WITH CHECK (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admin/HR manage applications" ON public.applications;
CREATE POLICY "Admin/HR manage applications" ON public.applications FOR ALL USING (auth.role() = 'authenticated');

-- Policies Assessments
DROP POLICY IF EXISTS "Admin access all assessments" ON public.assessments_and_interviews;
CREATE POLICY "Admin access all assessments" ON public.assessments_and_interviews FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Evaluator manage assigned assessment" ON public.assessments_and_interviews;
CREATE POLICY "Evaluator manage assigned assessment" ON public.assessments_and_interviews FOR UPDATE USING (
  auth.uid() = evaluator_id OR auth.role() = 'authenticated'
);

-- Policies Internal Notes
DROP POLICY IF EXISTS "HR/Admin manage internal notes" ON public.internal_notes;
CREATE POLICY "HR/Admin manage internal notes" ON public.internal_notes FOR ALL USING (auth.role() = 'authenticated');

-- Policies Audit Logs
DROP POLICY IF EXISTS "HR/Admin read audit logs" ON public.audit_logs;
CREATE POLICY "HR/Admin read audit logs" ON public.audit_logs FOR ALL USING (auth.role() = 'authenticated');

-- Policies Notifications
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated insert notifications" ON public.notifications;
CREATE POLICY "Authenticated insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================================
-- STORAGE BUCKET UNTUK RESUME PDF (MAX 2MB VALIDATED IN SERVER ACTIONS)
-- =====================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "User upload resume PDF" ON storage.objects;
CREATE POLICY "User upload resume PDF" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "User read resume PDF" ON storage.objects;
CREATE POLICY "User read resume PDF" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');

-- =====================================================================
-- SEED DATA AWAL (INITIAL JOBS FOR IMMEDIATE POPULATE)
-- =====================================================================
INSERT INTO public.jobs (id, title, dept, type, location, salary, status, min_education, required_skills, description, deadline_date)
VALUES
('1', 'Senior Backend Engineer', 'Engineering', 'Hybrid', 'Jakarta, Hybrid', 'Rp 25.000.000 – Rp 40.000.000 / bulan', 'Active', 'S1', ARRAY['Golang', 'Node.js', 'PostgreSQL', 'Docker', 'Redis', 'Microservices'], 'Kami mencari Senior Backend Engineer berpengalaman untuk membangun arsitektur microservices yang skalabel.', '2026-11-30 23:59:59+00'),
('2', 'Frontend Engineer (React)', 'Engineering', 'WFH', 'Remote', 'Rp 18.000.000 – Rp 30.000.000 / bulan', 'Active', 'S1', ARRAY['React.js', 'TypeScript', 'Next.js', 'Tailwind CSS', 'State Management'], 'Membangun antarmuka pengguna responsif dan performatif menggunakan Next.js App Router.', '2026-11-25 23:59:59+00'),
('3', 'Product Marketing Manager', 'Marketing', 'WFO', 'Jakarta, On-site', 'Rp 20.000.000 – Rp 32.000.000 / bulan', 'Active', 'S1', ARRAY['Product Positioning', 'Go-To-Market Strategy', 'Google Analytics', 'Copywriting'], 'Memimpin strategi go-to-market dan positioning produk internal perusahaan.', '2026-11-20 23:59:59+00'),
('4', 'Social Media Specialist', 'Marketing', 'WFH', 'Remote', 'Rp 8.000.000 – Rp 14.000.000 / bulan', 'Active', 'D3', ARRAY['Social Media Strategy', 'Instagram', 'LinkedIn', 'Copywriting', 'Content Creation'], 'Kelola dan kembangkan kehadiran digital media sosial resmi perusahaan.', '2026-11-28 23:59:59+00'),
('5', 'HR Business Partner', 'Human Resources', 'WFO', 'Surabaya, On-site', 'Rp 18.000.000 – Rp 28.000.000 / bulan', 'Active', 'S1', ARRAY['Talent Management', 'Employee Relations', 'UU Ketenagakerjaan', 'HRIS'], 'Mitra strategis HR untuk pengelolaan karyawan dan pengembangan talenta internal.', '2026-11-30 23:59:59+00'),
('6', 'Talent Acquisition Lead', 'Human Resources', 'Hybrid', 'Jakarta, Hybrid', 'Rp 22.000.000 – Rp 35.000.000 / bulan', 'Active', 'S1', ARRAY['Recruitment Strategy', 'Applicant Tracking System', 'Employer Branding', 'Interviewing'], 'Memimpin tim rekrutmen internal dan menyusun strategi alur seleksi karyawan.', '2026-11-15 23:59:59+00')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  dept = EXCLUDED.dept,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  salary = EXCLUDED.salary,
  status = EXCLUDED.status,
  min_education = EXCLUDED.min_education,
  required_skills = EXCLUDED.required_skills,
  description = EXCLUDED.description,
  deadline_date = EXCLUDED.deadline_date;
