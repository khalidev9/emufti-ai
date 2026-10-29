-- ==============================================================================
-- Migration: 20261017_production_settings_center.sql
-- EMUFTI AI - Production Settings Center: Preferences, Accessibility & Account Deletion
--
-- Features:
-- 1. Adds settings JSONB column and individual preference columns to public.profiles
-- 2. Preserves all existing profile records and preferences without overwriting
-- 3. Provides secure user account deletion RPC (delete_user_account)
-- 4. Reloads PostgREST schema cache
-- ==============================================================================

-- 1. Ensure settings JSONB column exists for flexible persistence
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- 2. Ensure individual settings columns exist on public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS reduced_motion BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS high_contrast BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS learning_level TEXT DEFAULT 'intermediate',
  ADD COLUMN IF NOT EXISTS learning_style TEXT DEFAULT 'explanation',
  ADD COLUMN IF NOT EXISTS preferred_school TEXT DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS answer_length TEXT DEFAULT 'balanced',
  ADD COLUMN IF NOT EXISTS explanation_style TEXT DEFAULT 'simple',
  ADD COLUMN IF NOT EXISTS show_references BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_schedule TEXT DEFAULT 'morning',
  ADD COLUMN IF NOT EXISTS reminder_timezone TEXT DEFAULT 'UTC';

-- 3. Secure user account deletion RPC function
-- Allows an authenticated user to completely delete their account and associated data
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS BOOLEAN AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Delete user bookmarks and saved items
  DELETE FROM public.saved_items WHERE user_id = v_uid;

  -- 2. Delete user chat messages and conversations
  DELETE FROM public.messages WHERE user_id = v_uid::text;
  DELETE FROM public.conversations WHERE user_id = v_uid::text;

  -- 3. Delete user plan requests
  DELETE FROM public.plan_requests WHERE user_id = v_uid;

  -- 4. Delete user support requests
  DELETE FROM public.support_requests WHERE user_id = v_uid;

  -- 5. Delete profile record
  DELETE FROM public.profiles WHERE id = v_uid;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- 4. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
