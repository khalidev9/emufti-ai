-- ==============================================================================
-- EMufti AI - Annual Subscription Duration Fix & Quiz System Architecture
-- Migration: 20261017_subscription_and_quiz_upgrade.sql
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- PART 1: Subscription Schema Enhancements & Safe Expiration Normalization
-- -----------------------------------------------------------------------------

-- Ensure explicit started_at and expires_at exist on public.subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly';

-- Backfill explicit timestamp aliases from existing period columns
UPDATE public.subscriptions
SET
  started_at = COALESCE(started_at, current_period_start, created_at),
  expires_at = COALESCE(expires_at, current_period_end),
  billing_interval = COALESCE(billing_interval, 'monthly')
WHERE started_at IS NULL OR expires_at IS NULL;

-- Ensure explicit started_at and expires_at exist on public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly';

UPDATE public.profiles
SET
  started_at = COALESCE(started_at, plan_activated_at, created_at),
  expires_at = COALESCE(expires_at, plan_expires_at)
WHERE started_at IS NULL OR expires_at IS NULL;

-- Repair any previously activated annual subscriptions where interval arithmetic
-- was mistakenly truncated to 30 days instead of 1 calendar year (365 days)
UPDATE public.subscriptions
SET
  current_period_end = current_period_start + INTERVAL '1 year',
  expires_at = current_period_start + INTERVAL '1 year',
  updated_at = timezone('utc'::text, now())
WHERE lower(trim(billing_interval)) IN ('yearly', 'annual', 'year')
  AND status = 'active'
  AND current_period_end < (current_period_start + INTERVAL '60 days');

UPDATE public.profiles
SET
  plan_expires_at = plan_activated_at + INTERVAL '1 year',
  expires_at = plan_activated_at + INTERVAL '1 year',
  updated_at = timezone('utc'::text, now())
WHERE lower(trim(billing_interval)) IN ('yearly', 'annual', 'year')
  AND plan IN ('pro', 'premium')
  AND plan_expires_at < (plan_activated_at + INTERVAL '60 days');

-- -----------------------------------------------------------------------------
-- PART 2: Update public.update_plan_request_status Atomic RPC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_plan_request_status(
  p_request_id UUID,
  p_status TEXT,
  p_admin_notes TEXT DEFAULT NULL,
  p_payment_verified BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req RECORD;
  v_user_id UUID;
  v_plan TEXT;
  v_interval TEXT;
  v_is_annual BOOLEAN;
  v_price NUMERIC;
  v_verified BOOLEAN;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_period_end TIMESTAMPTZ;
  v_notif_title TEXT;
  v_notif_message TEXT;
BEGIN
  -- 1. Security Check: Only verified administrators can execute this function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Only verified administrators can update plan requests.';
  END IF;

  -- 2. Validate requested status
  IF p_status NOT IN ('pending', 'under_review', 'approved', 'completed', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status "%". Allowed values: pending, under_review, approved, completed, rejected.', p_status;
  END IF;

  -- 3. Lock and retrieve the target plan request
  SELECT * INTO v_req FROM public.plan_requests WHERE id = p_request_id FOR UPDATE;
  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Plan request with ID "%" was not found.', p_request_id;
  END IF;

  -- 4. Determine payment verification flag
  IF p_payment_verified IS NOT NULL THEN
    v_verified := p_payment_verified;
  ELSIF p_status IN ('approved', 'completed') THEN
    v_verified := TRUE;
  ELSIF p_status = 'rejected' THEN
    v_verified := FALSE;
  ELSE
    v_verified := COALESCE(v_req.payment_verified, FALSE);
  END IF;

  -- 5. Extract exact requested plan (Allowlist: pro, premium)
  IF lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'pro'))) ILIKE '%premium%' THEN
    v_plan := 'premium';
  ELSE
    v_plan := 'pro';
  END IF;

  -- Robust check for annual billing interval
  -- Checks both billing_interval and duration strings safely
  v_is_annual := (
    lower(trim(COALESCE(v_req.billing_interval, ''))) IN ('yearly', 'annual', 'year', '1 year') OR
    lower(trim(COALESCE(v_req.duration, ''))) IN ('1 year', 'annual', 'yearly', 'year')
  );

  IF v_is_annual THEN
    v_interval := 'annual';
  ELSE
    v_interval := 'monthly';
  END IF;

  -- Authoritative pricing:
  -- Pro: $5.99/mo, $50.99/yr
  -- Premium: $20.99/mo, $75.99/yr
  IF v_plan = 'premium' THEN
    v_price := CASE WHEN v_is_annual THEN 75.99 ELSE 20.99 END;
  ELSE
    v_price := CASE WHEN v_is_annual THEN 50.99 ELSE 5.99 END;
  END IF;

  -- 6. Enforce payment verification before allowing approval/completion
  IF p_status IN ('approved', 'completed') AND v_verified IS NOT TRUE THEN
    RAISE EXCEPTION 'Cannot activate % plan for request %: Payment verification is required before approval and activation.',
      upper(v_plan), v_req.reference_id;
  END IF;

  -- 7. Resolve target user ID
  v_user_id := v_req.user_id;

  IF v_user_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
      v_user_id := NULL;
    END IF;
  END IF;

  IF v_user_id IS NULL AND v_req.email IS NOT NULL AND trim(v_req.email) <> '' THEN
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE lower(email) = lower(trim(v_req.email)) 
    LIMIT 1;
  END IF;

  IF v_user_id IS NULL AND v_req.email IS NOT NULL AND trim(v_req.email) <> '' THEN
    SELECT id INTO v_user_id 
    FROM public.profiles 
    WHERE lower(email) = lower(trim(v_req.email)) 
    LIMIT 1;
  END IF;

  -- 8. Enforce linked registered account before activating paid plan
  IF p_status IN ('approved', 'completed') AND v_user_id IS NULL THEN
    RAISE EXCEPTION 'Cannot activate % plan: Request % has no associated registered user account (email: "%"). The applicant must register an account first before approval can activate their subscription.',
      upper(v_plan), v_req.reference_id, COALESCE(v_req.email, 'unknown');
  END IF;

  -- 9. Calculate exact calendar duration: 1 calendar year for annual, 1 calendar month for monthly
  IF v_is_annual THEN
    v_period_end := v_now + INTERVAL '1 year';
  ELSE
    v_period_end := v_now + INTERVAL '1 month';
  END IF;

  -- 10. Update public.plan_requests atomically in transaction
  UPDATE public.plan_requests
  SET
    status = p_status,
    payment_verified = v_verified,
    user_id = COALESCE(public.plan_requests.user_id, v_user_id),
    plan = v_plan,
    plan_slug = v_plan,
    billing_interval = v_interval,
    duration = CASE WHEN v_is_annual THEN '1 year' ELSE '1 month' END,
    price_amount = v_price,
    currency = 'USD',
    admin_notes = COALESCE(p_admin_notes, public.plan_requests.admin_notes),
    approved_at = CASE WHEN p_status IN ('approved', 'completed') THEN v_now ELSE public.plan_requests.approved_at END,
    updated_at = v_now
  WHERE id = p_request_id;

  -- 11. If status is approved or completed, activate plan in profiles and record subscription
  IF p_status IN ('approved', 'completed') AND v_user_id IS NOT NULL THEN
    -- A. Update user profile to the exact requested plan with bundled Quran entitlement
    UPDATE public.profiles
    SET
      plan = v_plan,
      quran_plan = v_plan,
      plan_activated_at = v_now,
      plan_expires_at = v_period_end,
      started_at = v_now,
      expires_at = v_period_end,
      billing_interval = v_interval,
      updated_at = v_now
    WHERE id = v_user_id;

    IF NOT FOUND THEN
      INSERT INTO public.profiles (
        id,
        email,
        display_name,
        role,
        plan,
        quran_plan,
        plan_activated_at,
        plan_expires_at,
        started_at,
        expires_at,
        billing_interval,
        created_at,
        updated_at
      )
      VALUES (
        v_user_id,
        v_req.email,
        COALESCE(v_req.full_name, split_part(v_req.email, '@', 1)),
        'user',
        v_plan,
        v_plan,
        v_now,
        v_period_end,
        v_now,
        v_period_end,
        v_interval,
        v_now,
        v_now
      )
      ON CONFLICT (id) DO UPDATE SET
        plan = v_plan,
        quran_plan = v_plan,
        plan_activated_at = v_now,
        plan_expires_at = v_period_end,
        started_at = v_now,
        expires_at = v_period_end,
        billing_interval = v_interval,
        updated_at = v_now;
    END IF;

    -- B. Record in subscriptions table
    UPDATE public.subscriptions
    SET status = 'canceled', updated_at = v_now
    WHERE user_id = v_user_id
      AND lower(trim(status)) = 'active'
      AND (request_id IS NULL OR request_id <> p_request_id);

    -- Idempotent subscription insert/update for this specific request
    IF EXISTS (SELECT 1 FROM public.subscriptions WHERE request_id = p_request_id) THEN
      UPDATE public.subscriptions
      SET
        plan = v_plan,
        billing_interval = v_interval,
        price_amount = v_price,
        currency = 'USD',
        provider = 'manual',
        status = 'active',
        quran_access = TRUE,
        current_period_start = v_now,
        current_period_end = v_period_end,
        started_at = v_now,
        expires_at = v_period_end,
        updated_at = v_now
      WHERE request_id = p_request_id;
    ELSE
      INSERT INTO public.subscriptions (
        user_id,
        plan,
        billing_interval,
        price_amount,
        currency,
        provider,
        status,
        request_id,
        quran_access,
        current_period_start,
        current_period_end,
        started_at,
        expires_at,
        created_at,
        updated_at
      )
      VALUES (
        v_user_id,
        v_plan,
        v_interval,
        v_price,
        'USD',
        'manual',
        'active',
        p_request_id,
        TRUE,
        v_now,
        v_period_end,
        v_now,
        v_period_end,
        v_now,
        v_now
      );
    END IF;

    -- C. In-App Notification
    DECLARE
      v_plan_label TEXT := CASE WHEN v_plan = 'premium' THEN 'Premium' ELSE 'Pro' END;
      v_duration_label TEXT := CASE WHEN v_is_annual THEN 'sanad' ELSE 'bil' END;
    BEGIN
      v_notif_message := 'Hambalyo! Waxaad heshay subscription-kaaga ' || v_plan_label || ' muddo ' || v_duration_label || ' ah. Ku raaxayso adeegga EMufti AI.';
      IF v_is_annual THEN
        v_notif_title := 'Hambalyo! Subscription-kaaga sanadlaha ah waa la kiciyay (' || upper(v_plan) || ')';
      ELSE
        v_notif_title := 'Hambalyo! Subscription-kaaga bisha ah waa la kiciyay (' || upper(v_plan) || ')';
      END IF;
    END;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_notifications') THEN
      INSERT INTO public.user_notifications (
        user_id,
        title,
        message,
        type,
        metadata,
        is_read,
        created_at
      )
      VALUES (
        v_user_id,
        v_notif_title,
        v_notif_message,
        'subscription_activated',
        jsonb_build_object(
          'plan', v_plan,
          'billing_interval', v_interval,
          'duration', CASE WHEN v_is_annual THEN '1 year' ELSE '1 month' END,
          'request_id', p_request_id,
          'reference_id', v_req.reference_id,
          'activated_at', v_now,
          'expires_at', v_period_end
        ),
        FALSE,
        v_now
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'request_id', p_request_id,
    'status', p_status,
    'plan', v_plan,
    'billing_interval', v_interval,
    'duration', CASE WHEN v_is_annual THEN '1 year' ELSE '1 month' END,
    'activated_at', v_now,
    'expires_at', v_period_end,
    'payment_verified', v_verified,
    'user_id', v_user_id,
    'message', format('Plan request marked as "%s". %s plan activated (%s).', p_status, upper(v_plan), CASE WHEN v_is_annual THEN '1 Year' ELSE '1 Month' END)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.update_plan_request_status(UUID, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_plan_request_status(UUID, TEXT, TEXT, BOOLEAN) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- PART 3: Update public.claim_plan_offer Atomic RPC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_plan_offer(p_reference_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req RECORD;
  v_caller_id UUID;
  v_caller_email TEXT;
  v_plan TEXT;
  v_is_annual BOOLEAN;
  v_interval TEXT;
  v_duration_label TEXT;
  v_duration_interval INTERVAL;
  v_sub_id UUID;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required. Please sign in to claim your offer.';
  END IF;

  v_caller_email := lower(trim(COALESCE(auth.jwt() ->> 'email', '')));

  SELECT * INTO v_req
  FROM public.plan_requests
  WHERE upper(trim(reference_id)) = upper(trim(p_reference_id))
  FOR UPDATE;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Plan request "%" not found.', p_reference_id;
  END IF;

  IF v_req.user_id IS NOT NULL AND v_req.user_id <> v_caller_id THEN
    IF v_caller_email = '' OR lower(trim(COALESCE(v_req.email, ''))) <> v_caller_email THEN
      RAISE EXCEPTION 'Access denied. You can only claim offers belonging to your own account.';
    END IF;
  END IF;

  IF v_req.user_id IS NULL AND (v_req.email IS NULL OR lower(trim(v_req.email)) <> v_caller_email) THEN
    RAISE EXCEPTION 'Access denied. This offer belongs to a different email address.';
  END IF;

  IF v_req.status = 'claimed' THEN
    RAISE EXCEPTION 'This offer has already been claimed and is active.';
  END IF;

  IF v_req.status = 'rejected' THEN
    RAISE EXCEPTION 'This request was not approved and cannot be claimed.';
  END IF;

  IF v_req.status IN ('pending', 'under_review') THEN
    RAISE EXCEPTION 'Your request is pending review and has not yet been approved.';
  END IF;

  IF v_req.offer_expires_at IS NOT NULL AND v_req.offer_expires_at < v_now THEN
    UPDATE public.plan_requests SET status = 'expired', updated_at = v_now WHERE id = v_req.id;
    RAISE EXCEPTION 'This offer expired on % and can no longer be claimed.', to_char(v_req.offer_expires_at, 'YYYY-MM-DD');
  END IF;

  v_plan := lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'pro')));
  IF v_plan NOT IN ('pro', 'premium') THEN
    v_plan := 'pro';
  END IF;

  v_is_annual := (
    lower(trim(COALESCE(v_req.billing_interval, ''))) IN ('yearly', 'annual', 'year', '1 year') OR
    lower(trim(COALESCE(v_req.duration, ''))) IN ('1 year', 'annual', 'yearly', 'year')
  );

  IF v_is_annual THEN
    v_interval := 'annual';
    v_duration_label := '1 year';
    v_duration_interval := INTERVAL '1 year';
  ELSE
    v_interval := 'monthly';
    v_duration_label := '1 month';
    v_duration_interval := INTERVAL '1 month';
  END IF;

  UPDATE public.subscriptions
  SET status = 'canceled', updated_at = v_now
  WHERE user_id = v_caller_id AND status = 'active';

  INSERT INTO public.subscriptions (
    user_id,
    plan,
    provider,
    status,
    request_id,
    billing_interval,
    current_period_start,
    current_period_end,
    started_at,
    expires_at,
    created_at,
    updated_at
  )
  VALUES (
    v_caller_id,
    v_plan,
    'manual',
    'active',
    v_req.id,
    v_interval,
    v_now,
    v_now + v_duration_interval,
    v_now,
    v_now + v_duration_interval,
    v_now,
    v_now
  )
  RETURNING id INTO v_sub_id;

  UPDATE public.profiles
  SET
    plan = v_plan,
    quran_plan = v_plan,
    plan_activated_at = v_now,
    plan_expires_at = v_now + v_duration_interval,
    started_at = v_now,
    expires_at = v_now + v_duration_interval,
    billing_interval = v_interval,
    updated_at = v_now
  WHERE id = v_caller_id;

  UPDATE public.plan_requests
  SET
    status = 'claimed',
    claimed_at = v_now,
    subscription_id = v_sub_id,
    user_id = v_caller_id,
    payment_verified = TRUE,
    duration = v_duration_label,
    billing_interval = v_interval,
    updated_at = v_now
  WHERE id = v_req.id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'reference_id', v_req.reference_id,
    'plan', v_plan,
    'billing_interval', v_interval,
    'duration', v_duration_label,
    'subscription_id', v_sub_id,
    'activated_at', v_now,
    'expires_at', v_now + v_duration_interval,
    'message', format('Congratulations! Your %s plan has been activated successfully for %s.', upper(v_plan), v_duration_label)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_plan_offer(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_plan_offer(TEXT) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- PART 4: Update sync_user_plan_entitlements
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_user_plan_entitlements()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_sub RECORD;
  v_expired_count INT := 0;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Unauthenticated');
  END IF;

  UPDATE public.subscriptions
  SET status = 'expired', updated_at = v_now
  WHERE user_id = v_uid 
    AND lower(trim(status)) = 'active' 
    AND current_period_end IS NOT NULL 
    AND current_period_end <= v_now;

  SELECT * INTO v_sub
  FROM public.subscriptions
  WHERE user_id = v_uid 
    AND lower(trim(status)) = 'active' 
    AND (current_period_end IS NULL OR current_period_end > v_now)
  ORDER BY 
    CASE WHEN lower(trim(plan)) = 'premium' THEN 1 ELSE 2 END,
    current_period_end DESC
  LIMIT 1;

  IF v_sub IS NOT NULL THEN
    UPDATE public.profiles
    SET
      plan = v_sub.plan,
      quran_plan = v_sub.plan,
      plan_activated_at = v_sub.current_period_start,
      plan_expires_at = v_sub.current_period_end,
      started_at = v_sub.current_period_start,
      expires_at = v_sub.current_period_end,
      billing_interval = v_sub.billing_interval,
      updated_at = v_now
    WHERE id = v_uid;

    RETURN jsonb_build_object(
      'success', TRUE,
      'has_active_subscription', TRUE,
      'plan', v_sub.plan,
      'quran_plan', v_sub.plan,
      'billing_interval', v_sub.billing_interval,
      'plan_expires_at', v_sub.current_period_end,
      'expires_at', v_sub.current_period_end
    );
  ELSE
    UPDATE public.profiles
    SET
      plan = 'free',
      quran_plan = 'expired',
      billing_interval = 'free',
      updated_at = v_now
    WHERE id = v_uid AND plan IN ('pro', 'premium') AND (plan_expires_at IS NULL OR plan_expires_at <= v_now);

    RETURN jsonb_build_object(
      'success', TRUE,
      'has_active_subscription', FALSE,
      'plan', 'free',
      'quran_plan', 'expired'
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_user_plan_entitlements() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_user_plan_entitlements() TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- PART 5: EMufti Quiz System Database Tables & Constraints
-- -----------------------------------------------------------------------------

-- 1. Question Bank Table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('quran', 'hadith', 'seerah', 'fiqh', 'aqeedah', 'history', 'general')),
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_en TEXT NOT NULL,
  question_so TEXT NOT NULL,
  question_ar TEXT NOT NULL,
  options_en JSONB NOT NULL,
  options_so JSONB NOT NULL,
  options_ar JSONB NOT NULL,
  correct_index INT NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  explanation_en TEXT,
  explanation_so TEXT,
  explanation_ar TEXT,
  source_citation TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_cat ON public.quiz_questions (category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_diff ON public.quiz_questions (difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_verified ON public.quiz_questions (is_verified);

-- 2. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'all',
  difficulty TEXT NOT NULL DEFAULT 'all',
  total_questions INT NOT NULL DEFAULT 10,
  score INT NOT NULL DEFAULT 0,
  is_timed BOOLEAN NOT NULL DEFAULT FALSE,
  time_limit_seconds INT NOT NULL DEFAULT 0,
  extra_time_seconds INT NOT NULL DEFAULT 0,
  lifeline_50_50_used BOOLEAN NOT NULL DEFAULT FALSE,
  lifeline_2time_used BOOLEAN NOT NULL DEFAULT FALSE,
  lifeline_ask_emufti_used BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created ON public.quiz_attempts (created_at DESC);

-- 3. Quiz User Answers Table
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_index INT NOT NULL CHECK (selected_index >= 0 AND selected_index <= 3),
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt ON public.quiz_answers (attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_user ON public.quiz_answers (user_id);

-- -----------------------------------------------------------------------------
-- PART 6: Row Level Security (RLS) for Quiz System
-- -----------------------------------------------------------------------------
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- Questions: Readable by all authenticated and anonymous users
DROP POLICY IF EXISTS "Public read access to verified quiz questions" ON public.quiz_questions;
CREATE POLICY "Public read access to verified quiz questions"
  ON public.quiz_questions FOR SELECT
  USING (is_verified = TRUE);

-- Questions: Modifications strictly restricted to administrators
DROP POLICY IF EXISTS "Admin write access to quiz questions" ON public.quiz_questions;
CREATE POLICY "Admin write access to quiz questions"
  ON public.quiz_questions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Attempts: Users can view and manage their own attempts
DROP POLICY IF EXISTS "Users can read own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can read own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can create own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can update own quiz attempts"
  ON public.quiz_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Answers: Users can view and insert their own answers
DROP POLICY IF EXISTS "Users can read own quiz answers" ON public.quiz_answers;
CREATE POLICY "Users can read own quiz answers"
  ON public.quiz_answers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz answers" ON public.quiz_answers;
CREATE POLICY "Users can insert own quiz answers"
  ON public.quiz_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- PART 7: Quiz Atomic RPCs
-- -----------------------------------------------------------------------------

-- Atomic completion of quiz attempt
CREATE OR REPLACE FUNCTION public.complete_quiz_attempt(
  p_attempt_id UUID,
  p_score INT,
  p_lifeline_50_50 BOOLEAN DEFAULT FALSE,
  p_lifeline_2time BOOLEAN DEFAULT FALSE,
  p_lifeline_ask_emufti BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_attempt RECORD;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Unauthenticated');
  END IF;

  SELECT * INTO v_attempt
  FROM public.quiz_attempts
  WHERE id = p_attempt_id AND user_id = v_uid;

  IF v_attempt IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Attempt not found or access denied');
  END IF;

  UPDATE public.quiz_attempts
  SET
    score = p_score,
    lifeline_50_50_used = COALESCE(p_lifeline_50_50, lifeline_50_50_used),
    lifeline_2time_used = COALESCE(p_lifeline_2time, lifeline_2time_used),
    lifeline_ask_emufti_used = COALESCE(p_lifeline_ask_emufti, lifeline_ask_emufti_used),
    status = 'completed',
    completed_at = v_now
  WHERE id = p_attempt_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'attempt_id', p_attempt_id,
    'score', p_score,
    'completed_at', v_now
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_quiz_attempt(UUID, INT, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
