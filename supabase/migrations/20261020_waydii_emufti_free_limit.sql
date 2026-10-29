-- ==============================================================================
-- EMufti AI - "Waydii EMufti" Free Plan 2-Use Server Limit Migration
-- Migration: 20261020_waydii_emufti_free_limit.sql
-- Target Database: Supabase (PostgreSQL)
--
-- Features:
-- 1. Table public.quran_waydii_usage:
--    - Stores submitted "Waydii EMufti" questions per user with surah and ayah context.
--    - RLS enabled with authenticated user ownership and admin access.
-- 2. Server-side RPC public.get_waydii_emufti_status:
--    - Validates user subscription tier (Free, Pro, Premium, Admin).
--    - Returns allowed status, remaining uses (out of 2 for Free), and unlimited status for paid users.
-- 3. Server-side RPC public.record_waydii_emufti_usage:
--    - Atomic server-side enforcement with transaction advisory lock.
--    - Strictly prevents concurrency race conditions and Free-tier bypass beyond 2 submissions.
--    - Preserves unlimited access for paid Pro/Premium subscribers.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Table: public.quran_waydii_usage
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quran_waydii_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  ayah_number INT NOT NULL CHECK (ayah_number >= 1),
  category TEXT NOT NULL DEFAULT 'tafsiir',
  question_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_quran_waydii_usage_user 
  ON public.quran_waydii_usage(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quran_waydii_usage_surah_ayah 
  ON public.quran_waydii_usage(surah_number, ayah_number);

-- Enable RLS
ALTER TABLE public.quran_waydii_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own waydii usage" ON public.quran_waydii_usage;
CREATE POLICY "Users can view own waydii usage"
  ON public.quran_waydii_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own waydii usage" ON public.quran_waydii_usage;
CREATE POLICY "Users can insert own waydii usage"
  ON public.quran_waydii_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all waydii usage" ON public.quran_waydii_usage;
CREATE POLICY "Admins can manage all waydii usage"
  ON public.quran_waydii_usage FOR ALL
  TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 2. Helper: Check if a user is an active paid subscriber or admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_user_paid_subscriber(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 1. Check if user is admin
  IF public.is_admin() THEN
    RETURN TRUE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- 2. Check active subscription in subscriptions ledger
  IF EXISTS (
    SELECT 1 FROM public.subscriptions s
    LEFT JOIN public.plans p ON s.plan_id = p.id
    WHERE s.user_id = p_user_id
      AND s.status = 'active'
      AND (
        p.slug IN ('pro', 'premium') OR
        s.plan_id::text ILIKE '%pro%' OR
        s.plan_id::text ILIKE '%premium%'
      )
  ) THEN
    RETURN TRUE;
  END IF;

  -- 3. Check profile plan attribute
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND plan IN ('pro', 'premium')
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_user_paid_subscriber(UUID) TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 3. RPC: public.get_waydii_emufti_status
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_waydii_emufti_status(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := COALESCE(p_user_id, auth.uid());
  v_is_paid BOOLEAN := FALSE;
  v_count INT := 0;
  v_total_allowed INT := 2;
  v_remaining INT := 0;
BEGIN
  -- Authentication check
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', FALSE,
      'is_paid', FALSE,
      'plan', 'guest',
      'unlimited', FALSE,
      'allowed', FALSE,
      'uses_consumed', 0,
      'uses_remaining', 0,
      'total_allowed', v_total_allowed,
      'error', 'Fadlan gal koontadaada si aad u isticmaasho Waydii EMufti.'
    );
  END IF;

  -- Check paid status
  v_is_paid := public.is_user_paid_subscriber(v_uid);

  IF v_is_paid THEN
    RETURN jsonb_build_object(
      'authenticated', TRUE,
      'user_id', v_uid,
      'is_paid', TRUE,
      'plan', 'pro',
      'unlimited', TRUE,
      'allowed', TRUE,
      'uses_consumed', 0,
      'uses_remaining', 9999,
      'total_allowed', 9999
    );
  END IF;

  -- Count existing submissions for Free account across all Surahs/Ayahs
  SELECT COUNT(*) INTO v_count
  FROM public.quran_waydii_usage
  WHERE user_id = v_uid;

  IF v_count >= v_total_allowed THEN
    RETURN jsonb_build_object(
      'authenticated', TRUE,
      'user_id', v_uid,
      'is_paid', FALSE,
      'plan', 'free',
      'unlimited', FALSE,
      'allowed', FALSE,
      'uses_consumed', v_count,
      'uses_remaining', 0,
      'total_allowed', v_total_allowed,
      'message', 'Waxa aad dhammaysatay 2-dii su''aalood ee bilaashka ahaa ee Waydii EMufti. Fadlan u cusboonaysii Pro ama Premium si aad u hesho su''aalo aan xadidnayn.'
    );
  ELSE
    v_remaining := v_total_allowed - v_count;
    RETURN jsonb_build_object(
      'authenticated', TRUE,
      'user_id', v_uid,
      'is_paid', FALSE,
      'plan', 'free',
      'unlimited', FALSE,
      'allowed', TRUE,
      'uses_consumed', v_count,
      'uses_remaining', v_remaining,
      'total_allowed', v_total_allowed
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_waydii_emufti_status(UUID) TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 4. RPC: public.record_waydii_emufti_usage
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_waydii_emufti_usage(
  p_surah_number INT,
  p_ayah_number INT,
  p_category TEXT DEFAULT 'tafsiir',
  p_question_text TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := COALESCE(p_user_id, auth.uid());
  v_is_paid BOOLEAN := FALSE;
  v_count INT := 0;
  v_total_allowed INT := 2;
  v_remaining INT := 0;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'allowed', FALSE,
      'error', 'Authentication required to submit questions to Waydii EMufti.'
    );
  END IF;

  -- Validate Surah and Ayah numbers
  IF p_surah_number < 1 OR p_surah_number > 114 OR p_ayah_number < 1 THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'allowed', FALSE,
      'error', 'Invalid Surah or Ayah reference.'
    );
  END IF;

  v_is_paid := public.is_user_paid_subscriber(v_uid);

  -- Paid subscribers get unlimited usage
  IF v_is_paid THEN
    INSERT INTO public.quran_waydii_usage (user_id, surah_number, ayah_number, category, question_text)
    VALUES (v_uid, p_surah_number, p_ayah_number, COALESCE(p_category, 'tafsiir'), p_question_text);

    RETURN jsonb_build_object(
      'success', TRUE,
      'allowed', TRUE,
      'is_paid', TRUE,
      'unlimited', TRUE,
      'uses_consumed', 0,
      'uses_remaining', 9999,
      'total_allowed', 9999
    );
  END IF;

  -- FREE TIER: Acquire transaction-level advisory lock on user_id to prevent concurrency race conditions
  PERFORM pg_advisory_xact_lock(hashtext(v_uid::text));

  -- Re-read exact count inside lock
  SELECT COUNT(*) INTO v_count
  FROM public.quran_waydii_usage
  WHERE user_id = v_uid;

  -- If 2 or more uses have already been recorded, strictly reject
  IF v_count >= v_total_allowed THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'allowed', FALSE,
      'is_paid', FALSE,
      'unlimited', FALSE,
      'uses_consumed', v_count,
      'uses_remaining', 0,
      'total_allowed', v_total_allowed,
      'error', 'Waxa aad dhammaysatay 2-dii su''aalood ee bilaashka ahaa ee Waydii EMufti. Fadlan u cusboonaysii Pro ama Premium.'
    );
  END IF;

  -- Insert usage record
  INSERT INTO public.quran_waydii_usage (user_id, surah_number, ayah_number, category, question_text)
  VALUES (v_uid, p_surah_number, p_ayah_number, COALESCE(p_category, 'tafsiir'), p_question_text);

  v_count := v_count + 1;
  v_remaining := GREATEST(0, v_total_allowed - v_count);

  RETURN jsonb_build_object(
    'success', TRUE,
    'allowed', TRUE,
    'is_paid', FALSE,
    'unlimited', FALSE,
    'uses_consumed', v_count,
    'uses_remaining', v_remaining,
    'total_allowed', v_total_allowed
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_waydii_emufti_usage(INT, INT, TEXT, TEXT, UUID) TO anon, authenticated, service_role;
