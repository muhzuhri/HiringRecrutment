-- =====================================================================
-- PERBAIKAN TUNTAS: SUPABASE AUTH GO-TRUE (MENGATASI "Database error querying schema")
-- Jalankan di: Supabase Dashboard > SQL Editor (Klik RUN)
-- =====================================================================

-- 1. Aktifkan ekstensi pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Pastikan constraint mengizinkan role 'interviewer'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('candidate', 'recruiter', 'admin', 'interviewer'));

-- 3. Hapus akun lama agar kita pasang ulang dengan seluruh kolom string yang valid
DELETE FROM public.profiles WHERE email IN ('penilai@talenthub.com', 'admin@talenthub.com');
DELETE FROM auth.identities WHERE identity_data->>'email' IN ('penilai@talenthub.com', 'admin@talenthub.com') OR user_id IN ('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222');
DELETE FROM auth.users WHERE id IN ('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222') OR email IN ('penilai@talenthub.com', 'admin@talenthub.com');

-- 4. INSERT AKUN PENILAI
-- PENTING: GoTrue Go-runtime mewajibkan kolom token diisi string kosong (''), BUKAN NULL!
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  phone_change,
  phone_change_token,
  reauthentication_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'penilai@talenthub.com',
  crypt('Penilai123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dr. Bambang / Tim Penilai","role":"interviewer"}'::jsonb,
  false,
  NOW(),
  NOW(),
  '', '', '', '', '', '', '', ''
);

-- Insert identitas Auth
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  jsonb_build_object('sub', 'a1111111-1111-1111-1111-111111111111', 'email', 'penilai@talenthub.com'),
  'email',
  'penilai@talenthub.com',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (provider, provider_id) DO NOTHING;

-- Insert Profil Penilai
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  headline,
  profile_completed,
  created_at,
  updated_at
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'penilai@talenthub.com',
  'Dr. Bambang / Tim Penilai & Interviewer',
  'interviewer',
  'Lead Assessor & Technical Interviewer',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'interviewer',
  full_name = 'Dr. Bambang / Tim Penilai & Interviewer',
  updated_at = NOW();

-- 5. INSERT AKUN HR ADMIN
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  phone_change,
  phone_change_token,
  reauthentication_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b2222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'admin@talenthub.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Sarah Wijaya (Lead Recruiter)","role":"admin"}'::jsonb,
  false,
  NOW(),
  NOW(),
  '', '', '', '', '', '', '', ''
);

-- Insert identitas Auth Admin
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'b2222222-2222-2222-2222-222222222222',
  jsonb_build_object('sub', 'b2222222-2222-2222-2222-222222222222', 'email', 'admin@talenthub.com'),
  'email',
  'admin@talenthub.com',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (provider, provider_id) DO NOTHING;

-- Insert Profil Admin
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  headline,
  profile_completed,
  created_at,
  updated_at
) VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'admin@talenthub.com',
  'Sarah Wijaya (Lead Recruiter HR)',
  'admin',
  'Head of Talent Acquisition & HR Recruitment',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  full_name = 'Sarah Wijaya (Lead Recruiter HR)',
  updated_at = NOW();

-- 6. Update pencegahan jika ada kolom token NULL pada tabel auth.users
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE email IN ('penilai@talenthub.com', 'admin@talenthub.com');

NOTIFY pgrst, 'reload schema';
