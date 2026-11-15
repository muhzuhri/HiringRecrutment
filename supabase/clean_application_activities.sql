-- =====================================================================
-- BERSIHKAN SEMUA DATA AKTIVITAS REKRUTMEN & LAMARAN KERJA
-- (AKUN LOGIN, PROFIL KANDIDAT, PENDIDIKAN, PENGALAMAN, SKILL, SERTA AKUN HR & PENILAI TETAP AMAN)
-- =====================================================================

-- 1. Hapus riwayat log audit perubahan status
DELETE FROM public.audit_logs;

-- 2. Hapus catatan rahasia internal HR
DELETE FROM public.internal_notes;

-- 3. Hapus seluruh penilaian seleksi (Technical Test, Psikotes, Interview HR, Interview User)
DELETE FROM public.assessments_and_interviews;

-- 4. Hapus seluruh data notifikasi aktivitas rekrutmen
DELETE FROM public.notifications;

-- 5. Hapus seluruh data lamaran pekerjaan (Aktivitas Melamar)
DELETE FROM public.applications;

-- Catatan:
-- - Tabel `profiles` (Data Akun HR, Penilai, dan Kandidat) TIDAK DIHAPUS.
-- - Tabel `educations`, `experiences`, `skills`, `certifications` (Isi Profil Kandidat) TIDAK DIHAPUS.
-- - Tabel `jobs` (Master Lowongan Pekerjaan) TIDAK DIHAPUS.

