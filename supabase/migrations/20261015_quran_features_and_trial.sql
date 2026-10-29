-- ==============================================================================
-- EMufti AI - Quran Features, Digital Tasbeeh, Bookmarks & Trial Access Migration
-- Migration: 20261015_quran_features_and_trial.sql
-- Target Database: Supabase (ozvvxuzecwhlpbfongiy)
--
-- 1. Tables:
--    - public.quran_trial_sessions (Tracks server-side 3-use trial for Free accounts)
--    - public.quran_bookmarks (Stores user's saved verses with surah & verse number)
--    - public.quran_reading_progress (Remembers user's last read position)
--    - public.tasbeeh_logs (Saves user's digital tasbeeh count & target)
--
-- 2. Server-side RPCs:
--    - public.get_quran_access_status(p_user_id UUID): Checks active Pro/Premium or remaining trial sessions
--    - public.record_quran_session(p_user_id UUID): Idempotently records trial session and enforces 3-use limit
--
-- 3. Row Level Security:
--    - Fully enabled on all new tables with user-only access policies
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Table: quran_trial_sessions
CREATE TABLE IF NOT EXISTS public.quran_trial_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_type TEXT NOT NULL DEFAULT 'quran_access',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_daily_quran_session UNIQUE (user_id, session_date, session_type)
);

CREATE INDEX IF NOT EXISTS idx_quran_trial_user_id ON public.quran_trial_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_trial_session_date ON public.quran_trial_sessions(session_date);

-- 2. Table: quran_bookmarks
CREATE TABLE IF NOT EXISTS public.quran_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  verse_number INT NOT NULL CHECK (verse_number >= 1),
  surah_name TEXT NOT NULL,
  verse_text_preview TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_surah_verse_bookmark UNIQUE (user_id, surah_number, verse_number)
);

CREATE INDEX IF NOT EXISTS idx_quran_bookmarks_user ON public.quran_bookmarks(user_id);

-- 3. Table: quran_reading_progress
CREATE TABLE IF NOT EXISTS public.quran_reading_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_surah INT NOT NULL DEFAULT 1 CHECK (last_surah BETWEEN 1 AND 114),
  last_verse INT NOT NULL DEFAULT 1 CHECK (last_verse >= 1),
  surah_name TEXT DEFAULT 'Al-Fatihah',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Table: tasbeeh_logs
CREATE TABLE IF NOT EXISTS public.tasbeeh_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dhikr_id TEXT NOT NULL,
  dhikr_name TEXT NOT NULL,
  count INT NOT NULL DEFAULT 0 CHECK (count >= 0),
  target INT NOT NULL DEFAULT 33 CHECK (target > 0),
  total_completed_cycles INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_dhikr UNIQUE (user_id, dhikr_id)
);

CREATE INDEX IF NOT EXISTS idx_tasbeeh_user ON public.tasbeeh_logs(user_id);

-- -----------------------------------------------------------------------------
-- Enable Row Level Security (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.quran_trial_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasbeeh_logs ENABLE ROW LEVEL SECURITY;

-- Policies for quran_trial_sessions
DROP POLICY IF EXISTS "Users can view own quran trial sessions" ON public.quran_trial_sessions;
CREATE POLICY "Users can view own quran trial sessions"
  ON public.quran_trial_sessions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own quran trial sessions" ON public.quran_trial_sessions;
CREATE POLICY "Users can insert own quran trial sessions"
  ON public.quran_trial_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for quran_bookmarks
DROP POLICY IF EXISTS "Users can manage own quran bookmarks" ON public.quran_bookmarks;
CREATE POLICY "Users can manage own quran bookmarks"
  ON public.quran_bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for quran_reading_progress
DROP POLICY IF EXISTS "Users can manage own reading progress" ON public.quran_reading_progress;
CREATE POLICY "Users can manage own reading progress"
  ON public.quran_reading_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for tasbeeh_logs
DROP POLICY IF EXISTS "Users can manage own tasbeeh logs" ON public.tasbeeh_logs;
CREATE POLICY "Users can manage own tasbeeh logs"
  ON public.tasbeeh_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- RPC: public.get_quran_access_status
-- Inspects user's active plan ledger and trial session records
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_quran_access_status(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_target_user_id UUID;
  v_plan TEXT := 'free';
  v_is_paid BOOLEAN := FALSE;
  v_trial_limit INT := 3;
  v_sessions_count INT := 0;
  v_remaining_uses INT := 0;
  v_has_access BOOLEAN := FALSE;
  v_is_exhausted BOOLEAN := FALSE;
  v_today_active BOOLEAN := FALSE;
BEGIN
  -- 1. Determine target user
  v_target_user_id := COALESCE(p_user_id, auth.uid());
  IF v_target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', FALSE,
      'is_paid_member', FALSE,
      'plan', 'free',
      'trial_uses_total', v_trial_limit,
      'trial_uses_consumed', 0,
      'trial_uses_remaining', 0,
      'has_trial_access', FALSE,
      'trial_exhausted', TRUE,
      'error', 'Authentication required for Quran trial access'
    );
  END IF;

  -- 2. Inspect active subscriptions ledger
  IF EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = v_target_user_id
      AND status = 'active'
      AND (
        plan_id ILIKE '%pro%' OR plan_id ILIKE '%premium%' OR
        plan_id IN ('pro', 'premium', 'plan_pro', 'plan_premium')
      )
  ) THEN
    v_is_paid := TRUE;
    SELECT CASE 
      WHEN plan_id ILIKE '%premium%' THEN 'premium'
      ELSE 'pro'
    END INTO v_plan
    FROM public.subscriptions
    WHERE user_id = v_target_user_id AND status = 'active'
    ORDER BY created_at DESC LIMIT 1;
  ELSE
    -- Check profiles table fallback
    SELECT plan INTO v_plan FROM public.profiles WHERE id = v_target_user_id;
    IF v_plan IN ('pro', 'premium') THEN
      v_is_paid := TRUE;
    ELSE
      v_plan := 'free';
    END IF;
  END IF;

  -- 3. If user has active Pro/Premium or is Admin -> Unlimited Access
  IF v_is_paid OR public.is_admin() THEN
    RETURN jsonb_build_object(
      'authenticated', TRUE,
      'user_id', v_target_user_id,
      'is_paid_member', TRUE,
      'plan', COALESCE(v_plan, 'pro'),
      'trial_uses_total', v_trial_limit,
      'trial_uses_consumed', 0,
      'trial_uses_remaining', v_trial_limit,
      'has_trial_access', TRUE,
      'trial_exhausted', FALSE,
      'unlimited', TRUE
    );
  END IF;

  -- 4. Count trial sessions for Free users
  SELECT count(*) INTO v_sessions_count
  FROM public.quran_trial_sessions
  WHERE user_id = v_target_user_id;

  -- Check if already has a session logged today
  SELECT EXISTS (
    SELECT 1 FROM public.quran_trial_sessions
    WHERE user_id = v_target_user_id AND session_date = CURRENT_DATE
  ) INTO v_today_active;

  v_remaining_uses := GREATEST(0, v_trial_limit - v_sessions_count);
  v_is_exhausted := (v_sessions_count >= v_trial_limit AND NOT v_today_active);
  v_has_access := (v_sessions_count < v_trial_limit OR v_today_active);

  RETURN jsonb_build_object(
    'authenticated', TRUE,
    'user_id', v_target_user_id,
    'is_paid_member', FALSE,
    'plan', 'free',
    'trial_uses_total', v_trial_limit,
    'trial_uses_consumed', v_sessions_count,
    'trial_uses_remaining', v_remaining_uses,
    'has_trial_access', v_has_access,
    'trial_exhausted', v_is_exhausted,
    'session_active_today', v_today_active,
    'unlimited', FALSE
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_quran_access_status(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quran_access_status(UUID) TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- RPC: public.record_quran_session
-- Idempotent session creation for 3-use Free trial
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_quran_session(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_target_user_id UUID;
  v_status JSONB;
  v_today_exists BOOLEAN;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  v_target_user_id := COALESCE(p_user_id, auth.uid());
  IF v_target_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to start a Quran session.';
  END IF;

  -- Verify caller is authorized
  IF auth.uid() IS NOT NULL AND auth.uid() <> v_target_user_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. You can only record your own Quran trial sessions.';
  END IF;

  -- Check access status first
  v_status := public.get_quran_access_status(v_target_user_id);

  -- If paid member, no trial consumed
  IF (v_status->>'is_paid_member')::boolean IS TRUE THEN
    RETURN v_status;
  END IF;

  -- Check if session already recorded today (Idempotent: 1 session per day)
  SELECT EXISTS (
    SELECT 1 FROM public.quran_trial_sessions
    WHERE user_id = v_target_user_id AND session_date = CURRENT_DATE
  ) INTO v_today_exists;

  IF v_today_exists THEN
    -- Already counted for today, do not consume another use
    RETURN public.get_quran_access_status(v_target_user_id);
  END IF;

  -- Check if all 3 trial sessions are already consumed
  IF (v_status->>'trial_uses_consumed')::int >= 3 THEN
    RETURN jsonb_build_object(
      'authenticated', TRUE,
      'user_id', v_target_user_id,
      'is_paid_member', FALSE,
      'plan', 'free',
      'trial_uses_total', 3,
      'trial_uses_consumed', (v_status->>'trial_uses_consumed')::int,
      'trial_uses_remaining', 0,
      'has_trial_access', FALSE,
      'trial_exhausted', TRUE,
      'message', 'Free trial has ended. Upgrade to Pro Quran or Premium Quran to continue enjoying full access.'
    );
  END IF;

  -- Record new session
  INSERT INTO public.quran_trial_sessions (user_id, session_date, session_type, created_at)
  VALUES (v_target_user_id, CURRENT_DATE, 'quran_access', v_now)
  ON CONFLICT (user_id, session_date, session_type) DO NOTHING;

  -- Return updated status
  RETURN public.get_quran_access_status(v_target_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.record_quran_session(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_quran_session(UUID) TO authenticated, service_role;
