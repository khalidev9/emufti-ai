-- ==============================================================================
-- Migration: 20261017_system_language_settings.sql
-- EMUFTI AI - System Language Default to English ('en')
--
-- Features:
-- 1. Updates default preferred_language on public.profiles to 'en' for future rows
-- 2. Preserves all existing user preferences ('so', 'en', 'ar') without overwriting
-- 3. Enforces valid check constraint: 'en', 'so', 'ar'
-- 4. Notifies PostgREST to reload the schema cache
-- ==============================================================================

-- 1. Set default preferred_language to 'en' for future profile rows
ALTER TABLE public.profiles 
  ALTER COLUMN preferred_language SET DEFAULT 'en';

-- 2. Ensure constraint allows 'en', 'so', 'ar' safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_preferred_language_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_preferred_language_check
      CHECK (preferred_language IN ('en', 'so', 'ar'));
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
