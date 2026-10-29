-- ==============================================================================
-- EMufti AI - Confirm Administrator Account & Profile Role
-- Migration: 20261016_confirm_admin_user.sql
--
-- Features:
-- 1. Confirms email for admin@emufti.ai in auth.users so the administrator
--    can authenticate without being blocked by email confirmation checks.
-- 2. Ensures the profile in public.profiles exists and has role = 'admin'.
-- ==============================================================================

-- 1. Confirm email in auth.users for admin@emufti.ai
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE lower(email) = 'admin@emufti.ai';

-- 2. Ensure matching profile in public.profiles has role = 'admin'
INSERT INTO public.profiles (id, email, display_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'display_name', 'Chief Administrator'), 
  'admin'
FROM auth.users
WHERE lower(email) = 'admin@emufti.ai'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', email = 'admin@emufti.ai';
