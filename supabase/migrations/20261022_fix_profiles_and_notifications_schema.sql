-- =============================================================================
-- EMUFTI AI: Profiles & User Notifications Schema Repair
-- Migration: 20261022_fix_profiles_and_notifications_schema.sql
-- 
-- Fixes:
-- 1. Adds missing columns to public.profiles to prevent PostgREST 400 Bad Request
--    (quran_plan, plan_expires_at, started_at, expires_at, billing_interval, default_response_language).
-- 2. Creates public.user_notifications table with foreign key, indexes, and RLS policies
--    to prevent PostgREST 404 Not Found (PGRST205).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Ensure public.profiles table and columns exist with safe defaults
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  phone_country_code TEXT DEFAULT 'SO',
  preferred_language TEXT DEFAULT 'so',
  role TEXT DEFAULT 'user',
  plan TEXT NOT NULL DEFAULT 'free',
  plan_activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quran_plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_response_language TEXT DEFAULT 'auto';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quran_trial_started_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quran_trial_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT 'blue';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interface_density TEXT DEFAULT 'comfortable';

-- Grant required permissions
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

-- -----------------------------------------------------------------------------
-- 2. Create public.user_notifications table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'plan_activation',
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);

-- Unique index to prevent duplicate plan activation notifications for the same request
CREATE UNIQUE INDEX IF NOT EXISTS idx_uniq_plan_activation_notif
  ON public.user_notifications(user_id, (metadata->>'request_id'))
  WHERE type = 'plan_activation';

-- -----------------------------------------------------------------------------
-- 3. Row Level Security on user_notifications
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_notifications TO authenticated;
GRANT ALL ON TABLE public.user_notifications TO service_role;

DROP POLICY IF EXISTS "Users can read own notifications" ON public.user_notifications;
CREATE POLICY "Users can read own notifications"
  ON public.user_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.user_notifications;
CREATE POLICY "Users can update own notifications"
  ON public.user_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert notifications" ON public.user_notifications;
CREATE POLICY "Admins can insert notifications"
  ON public.user_notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');
