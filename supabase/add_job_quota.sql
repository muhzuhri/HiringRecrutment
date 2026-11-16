-- =====================================================================
-- MIGRATION: Tambah kolom kuota & perizinan RLS pelamar lowongan
-- Jalankan di: Supabase Dashboard > SQL Editor > Run (Tombol Hijau)
-- =====================================================================

-- 1. Tambah kolom quota & applicant_count pada tabel jobs (jika belum ada)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS quota INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS applicant_count INTEGER DEFAULT 0;

COMMENT ON COLUMN public.jobs.quota IS 'Kuota penerimaan / jumlah kebutuhan pelamar untuk lowongan';
COMMENT ON COLUMN public.jobs.applicant_count IS 'Jumlah total pelamar yang terdaftar pada lowongan';

-- 2. Kebijakan RLS agar publik (pengunjung tanpa login) diizinkan membaca data aplikasi untuk hitungan pelamar:
DO $$
BEGIN
  -- Hapus policy lama jika ada bentrok
  DROP POLICY IF EXISTS "Allow public read applications count" ON public.applications;
  
  -- Buat policy baru yang mengizinkan anon & authenticated membaca tabel applications
  CREATE POLICY "Allow public read applications count"
    ON public.applications
    FOR SELECT
    TO anon, authenticated
    USING (true);
END $$;

-- 3. Hitung dan sinkronisasikan langsung jumlah pelamar saat ini ke setiap lowongan di tabel jobs
UPDATE public.jobs j
SET applicant_count = (
  SELECT COUNT(*)
  FROM public.applications a
  WHERE a.job_id = j.id
);
