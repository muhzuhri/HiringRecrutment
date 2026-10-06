-- =====================================================================
-- FIX: TABEL APPLICATIONS & AUDIT LOGS RLS POLICIES
-- Jalankan di: Supabase Dashboard > SQL Editor
-- =====================================================================

-- 1. Pastikan tabel applications memiliki default UUID & RLS diaktifkan
ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Kebijakan RLS untuk tabel applications (Kandidat & Admin)
DROP POLICY IF EXISTS "Candidates read own applications" ON public.applications;
CREATE POLICY "Candidates read own applications" ON public.applications 
  FOR SELECT USING (auth.uid() = candidate_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Candidates insert application" ON public.applications;
CREATE POLICY "Candidates insert application" ON public.applications 
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admin/HR manage applications" ON public.applications;
CREATE POLICY "Admin/HR manage applications" ON public.applications 
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. Kebijakan RLS untuk tabel audit_logs
DROP POLICY IF EXISTS "Allow authenticated insert audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated insert audit logs" ON public.audit_logs 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "HR/Admin read audit logs" ON public.audit_logs;
CREATE POLICY "HR/Admin read audit logs" ON public.audit_logs 
  FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- =====================================================================
-- SELESAI. Pengiriman lamaran kandidat sekarang 100% tersimpan ke DB.
-- =====================================================================
