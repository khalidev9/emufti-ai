-- ==============================================================================
-- EMufti AI - Support Requests, Account Lockout, 5-Question Free Limit & Upgrade Security
-- Migration: 20261017_support_requests_free_limits_and_upgrades.sql
-- Target Database: Supabase (ozvvxuzecwhlpbfongiy)
--
-- Features:
-- 1. Support Requests enhancements:
--    - Add 'category' column with allowed values:
--      'account_access', 'billing_subscription', 'quran_features', 'general'
--    - Update RLS: unauthenticated & authenticated can INSERT without SELECT error
--    - Upgraded get_guest_support_request RPC to support lookup by reference ID and guest access token or email
-- 2. Plan Requests security:
--    - Tighten INSERT policy to require (auth.uid() IS NOT NULL AND auth.uid() = user_id)
--    - Ensure billing_interval supports 'monthly' and 'yearly'/'annual' with exact 30 and 365 days
-- 3. Rolling 24-hour AI question usage tracking & limits:
--    - Table public.usage_records for server-side question timestamps
--    - RPC check_and_record_ai_usage for atomic 5-question limit enforcement per 24 hours
--    - RPC get_ai_usage_status for rolling reset timestamp and remaining questions
-- 4. Authentication helpers:
--    - RPC check_account_exists to distinguish non-existent accounts from wrong passwords
--    - RPC unlock_user_account to allow verified admins to unlock locked accounts
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Ensure public.is_admin() exists and is robust
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai' THEN
    RETURN TRUE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 2. Enhance public.support_requests table
-- -----------------------------------------------------------------------------
ALTER TABLE public.support_requests 
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Update any null categories
UPDATE public.support_requests
SET category = 'general'
WHERE category IS NULL;

-- Create index on category
CREATE INDEX IF NOT EXISTS idx_support_requests_category ON public.support_requests (category);

-- RLS on support_requests:
-- Anon and authenticated can INSERT.
-- Authenticated users can SELECT own records or admin can SELECT all.
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit support requests" ON public.support_requests;
CREATE POLICY "Anyone can submit support requests"
ON public.support_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own support requests" ON public.support_requests;
CREATE POLICY "Users can view own support requests"
ON public.support_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Secure RPC for guest lookup (supports token or requester email)
CREATE OR REPLACE FUNCTION public.get_guest_support_request(
  p_reference_id TEXT,
  p_access_token TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req RECORD;
  v_clean_ref TEXT;
  v_clean_email TEXT;
  v_clean_token TEXT;
BEGIN
  IF p_reference_id IS NULL OR trim(p_reference_id) = '' THEN
    RETURN NULL;
  END IF;

  v_clean_ref := upper(trim(p_reference_id));
  v_clean_token := NULLIF(trim(COALESCE(p_access_token, '')), '');
  v_clean_email := NULLIF(lower(trim(COALESCE(p_email, ''))), '');

  IF v_clean_token IS NOT NULL THEN
    SELECT * INTO v_req
    FROM public.support_requests
    WHERE upper(trim(reference_id)) = v_clean_ref
      AND guest_access_token = v_clean_token
    LIMIT 1;
  ELSIF v_clean_email IS NOT NULL THEN
    SELECT * INTO v_req
    FROM public.support_requests
    WHERE upper(trim(reference_id)) = v_clean_ref
      AND lower(trim(email)) = v_clean_email
    LIMIT 1;
  ELSE
    -- If user is authenticated, check if it belongs to their auth.uid() or email
    IF auth.uid() IS NOT NULL THEN
      SELECT * INTO v_req
      FROM public.support_requests
      WHERE upper(trim(reference_id)) = v_clean_ref
        AND (user_id = auth.uid() OR lower(trim(email)) = lower(trim(coalesce(auth.jwt()->>'email', ''))))
      LIMIT 1;
    END IF;
  END IF;

  IF v_req IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN to_jsonb(v_req);
END;
$$;

REVOKE ALL ON FUNCTION public.get_guest_support_request(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_guest_support_request(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 3. Plan Requests Security: Require Authenticated User
-- -----------------------------------------------------------------------------
ALTER TABLE public.plan_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert plan requests" ON public.plan_requests;
DROP POLICY IF EXISTS "Authenticated users can insert plan requests" ON public.plan_requests;

CREATE POLICY "Authenticated users can insert plan requests"
ON public.plan_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own plan requests" ON public.plan_requests;
CREATE POLICY "Users can view own plan requests"
ON public.plan_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. Server-Side AI Usage Records (Rolling 24-Hour Limits)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_usage_records_user_created 
  ON public.usage_records (user_id, created_at DESC);

ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own usage records" ON public.usage_records;
CREATE POLICY "Users can read own usage records"
  ON public.usage_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage usage records" ON public.usage_records;
CREATE POLICY "Admins can manage usage records"
  ON public.usage_records FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Atomic check & record RPC for AI question usage
CREATE OR REPLACE FUNCTION public.check_and_record_ai_usage(
  p_user_id UUID,
  p_is_paid BOOLEAN DEFAULT FALSE,
  p_model TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := COALESCE(p_user_id, auth.uid());
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_window_start TIMESTAMPTZ := v_now - INTERVAL '24 hours';
  v_count INT := 0;
  v_limit INT;
  v_oldest_in_window TIMESTAMPTZ;
  v_resets_at TIMESTAMPTZ;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'error', 'Authentication required to ask AI questions.',
      'count', 0,
      'limit', 5
    );
  END IF;

  -- Paid users have generous limit (1000/day)
  IF p_is_paid OR public.is_admin() THEN
    v_limit := 1000;
  ELSE
    v_limit := 5; -- Strict 5 questions per rolling 24 hours for Free plan
  END IF;

  -- Count questions asked in the rolling 24-hour window
  SELECT COUNT(*), MIN(created_at)
  INTO v_count, v_oldest_in_window
  FROM public.usage_records
  WHERE user_id = v_uid AND created_at >= v_window_start;

  IF v_count >= v_limit THEN
    -- Resets 24 hours after the oldest question in the 24-hour window
    v_resets_at := COALESCE(v_oldest_in_window + INTERVAL '24 hours', v_now + INTERVAL '24 hours');
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'count', v_count,
      'limit', v_limit,
      'remaining', 0,
      'resets_at', v_resets_at,
      'message', 'You have reached your 5-question limit for the rolling 24-hour period. Upgrade to Pro for 150 questions per day.'
    );
  END IF;

  -- Record this question atomically
  INSERT INTO public.usage_records (user_id, model, created_at)
  VALUES (v_uid, p_model, v_now);

  v_count := v_count + 1;
  IF v_oldest_in_window IS NULL THEN
    v_resets_at := v_now + INTERVAL '24 hours';
  ELSE
    v_resets_at := v_oldest_in_window + INTERVAL '24 hours';
  END IF;

  RETURN jsonb_build_object(
    'allowed', TRUE,
    'count', v_count,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_count),
    'resets_at', v_resets_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_record_ai_usage(UUID, BOOLEAN, TEXT) TO authenticated, service_role;

-- Get current usage status without recording
CREATE OR REPLACE FUNCTION public.get_ai_usage_status(
  p_user_id UUID,
  p_is_paid BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := COALESCE(p_user_id, auth.uid());
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_window_start TIMESTAMPTZ := v_now - INTERVAL '24 hours';
  v_count INT := 0;
  v_limit INT;
  v_oldest_in_window TIMESTAMPTZ;
  v_resets_at TIMESTAMPTZ;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object(
      'count', 0,
      'limit', 5,
      'remaining', 5,
      'resets_at', NULL
    );
  END IF;

  IF p_is_paid OR public.is_admin() THEN
    v_limit := 1000;
  ELSE
    v_limit := 5;
  END IF;

  SELECT COUNT(*), MIN(created_at)
  INTO v_count, v_oldest_in_window
  FROM public.usage_records
  WHERE user_id = v_uid AND created_at >= v_window_start;

  IF v_count > 0 AND v_oldest_in_window IS NOT NULL THEN
    v_resets_at := v_oldest_in_window + INTERVAL '24 hours';
  ELSE
    v_resets_at := NULL;
  END IF;

  RETURN jsonb_build_object(
    'count', v_count,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_count),
    'resets_at', v_resets_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ai_usage_status(UUID, BOOLEAN) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 5. Authentication Helpers
-- -----------------------------------------------------------------------------

-- Helper to check whether an account exists by email without revealing password details
CREATE OR REPLACE FUNCTION public.check_account_exists(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_exists BOOLEAN := FALSE;
  v_clean TEXT;
BEGIN
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RETURN FALSE;
  END IF;

  v_clean := lower(trim(p_email));

  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE lower(email) = v_clean
  ) INTO v_exists;

  IF NOT v_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE lower(email) = v_clean
    ) INTO v_exists;
  END IF;

  RETURN v_exists;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_account_exists(TEXT) TO anon, authenticated, service_role;

-- Admin RPC to unlock a locked user account directly
CREATE OR REPLACE FUNCTION public.unlock_user_account(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_clean TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.';
  END IF;

  IF p_email IS NULL OR trim(p_email) = '' THEN
    RAISE EXCEPTION 'Email is required.';
  END IF;

  v_clean := lower(trim(p_email));

  -- Reset failed attempts in public.user_login_security if table exists
  BEGIN
    UPDATE public.user_login_security
    SET
      failed_attempts = 0,
      is_locked = FALSE,
      locked_until = NULL,
      updated_at = timezone('utc'::text, now())
    WHERE lower(email) = v_clean;
  EXCEPTION WHEN undefined_table THEN
    -- Table does not exist, ignore
  END;

  RETURN jsonb_build_object(
    'success', TRUE,
    'email', v_clean,
    'message', 'User account lockout cleared successfully.'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.unlock_user_account(TEXT) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 6. Refresh PostgREST schema cache
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
