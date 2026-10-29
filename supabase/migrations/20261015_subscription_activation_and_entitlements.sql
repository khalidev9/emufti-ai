-- ==============================================================================
-- EMufti AI - Subscription Activation, Pricing, Somali Notification & Quran Entitlements
-- Migration: 20261015_subscription_activation_and_entitlements.sql
-- Target Database: Supabase (ozvvxuzecwhlpbfongiy)
--
-- Features:
-- 1. Schema Enhancements:
--    - profiles: quran_plan ('free','trial','pro','premium','expired'), plan_expires_at, billing_interval,
--                quran_trial_started_at, quran_trial_expires_at
--    - plan_requests: billing_interval ('monthly','yearly'), price_amount, currency
--    - subscriptions: billing_interval, price_amount, currency, quran_access
--    - user_notifications: persistent in-app notifications for users with RLS
-- 2. Atomic Server-Side RPC:
--    - update_plan_request_status:
--        * Strict admin check
--        * Verification check (unverified payment CANNOT activate)
--        * Linked user check (unlinked request CANNOT activate)
--        * Plan allowlist ('pro','premium')
--        * Exact duration: 30 days for monthly, 365 days for annual
--        * Bundled Quran entitlement: Pro -> Quran Pro, Premium -> Quran Premium
--        * Single active subscription ledger entry (cancels previous active ones)
--        * Persistent Somali congratulatory notification (idempotent, no duplicates)
-- 3. Two-Day Quran Free Trial Server-Side RPCs:
--    - get_quran_access_status: Checks active paid subscription or 2-day trial window
--    - start_quran_free_trial: Idempotently initializes the exact 2-day trial window
-- 4. Expiration & Entitlement Sync:
--    - sync_user_plan_entitlements: Reverts expired subscriptions cleanly
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Schema Updates on public.profiles
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quran_plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quran_trial_started_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quran_trial_expires_at TIMESTAMPTZ;

-- Ensure constraint on profiles.quran_plan
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_quran_plan'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT chk_profiles_quran_plan CHECK (quran_plan IN ('free', 'trial', 'pro', 'premium', 'expired'));
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Schema Updates on public.plan_requests
-- -----------------------------------------------------------------------------
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'monthly';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS price_amount NUMERIC NOT NULL DEFAULT 5.99;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_plan_requests_billing_interval'
  ) THEN
    ALTER TABLE public.plan_requests
    ADD CONSTRAINT chk_plan_requests_billing_interval CHECK (billing_interval IN ('monthly', 'yearly'));
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. Schema Updates on public.subscriptions
-- -----------------------------------------------------------------------------
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'monthly';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS price_amount NUMERIC;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS quran_access BOOLEAN NOT NULL DEFAULT TRUE;

-- -----------------------------------------------------------------------------
-- 4. Create public.user_notifications table
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

-- Enable Row Level Security (RLS) on user_notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notifications" ON public.user_notifications;
CREATE POLICY "Users can read own notifications"
  ON public.user_notifications FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.user_notifications;
CREATE POLICY "Users can update own notifications"
  ON public.user_notifications FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert notifications" ON public.user_notifications;
CREATE POLICY "Admins can insert notifications"
  ON public.user_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 5. Helper Function: start_quran_free_trial
-- Starts a 2-day free trial for a user if not previously initiated.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.start_quran_free_trial(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := COALESCE(p_user_id, auth.uid());
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_started_at TIMESTAMPTZ;
  v_expires_at TIMESTAMPTZ;
  v_plan TEXT;
  v_quran_plan TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Authentication required to start Quran Free Trial.'
    );
  END IF;

  SELECT plan, quran_plan, quran_trial_started_at, quran_trial_expires_at
  INTO v_plan, v_quran_plan, v_started_at, v_expires_at
  FROM public.profiles
  WHERE id = v_uid;

  -- Paid members do not need a trial; do not downgrade
  IF v_plan IN ('pro', 'premium') OR v_quran_plan IN ('pro', 'premium') THEN
    RETURN jsonb_build_object(
      'success', TRUE,
      'is_paid_member', TRUE,
      'has_trial_access', TRUE,
      'trial_exhausted', FALSE,
      'plan', COALESCE(v_quran_plan, v_plan, 'pro'),
      'unlimited', TRUE
    );
  END IF;

  -- If trial already started, return current window without resetting
  IF v_started_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', TRUE,
      'is_paid_member', FALSE,
      'has_trial_access', (v_now < v_expires_at),
      'trial_exhausted', (v_now >= v_expires_at),
      'trial_started_at', v_started_at,
      'trial_expires_at', v_expires_at,
      'seconds_remaining', GREATEST(0, EXTRACT(EPOCH FROM (v_expires_at - v_now))::INT),
      'unlimited', FALSE
    );
  END IF;

  -- Start new 2-day trial
  v_started_at := v_now;
  v_expires_at := v_now + INTERVAL '2 days';

  UPDATE public.profiles
  SET
    quran_plan = 'trial',
    quran_trial_started_at = v_started_at,
    quran_trial_expires_at = v_expires_at,
    updated_at = v_now
  WHERE id = v_uid;

  RETURN jsonb_build_object(
    'success', TRUE,
    'is_paid_member', FALSE,
    'has_trial_access', TRUE,
    'trial_exhausted', FALSE,
    'trial_started_at', v_started_at,
    'trial_expires_at', v_expires_at,
    'seconds_remaining', 172800,
    'unlimited', FALSE
  );
END;
$$;

REVOKE ALL ON FUNCTION public.start_quran_free_trial(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_quran_free_trial(UUID) TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 6. Server-Side RPC: get_quran_access_status
-- Accurately verifies AI & Quran entitlements and enforces 2-day trial
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_quran_access_status(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := COALESCE(p_user_id, auth.uid());
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_is_paid BOOLEAN := FALSE;
  v_plan TEXT := 'free';
  v_quran_plan TEXT := 'free';
  v_started_at TIMESTAMPTZ;
  v_expires_at TIMESTAMPTZ;
  v_seconds_rem INT := 0;
  v_has_access BOOLEAN := FALSE;
  v_exhausted BOOLEAN := FALSE;
BEGIN
  -- 1. Anonymous visitor
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', FALSE,
      'is_paid_member', FALSE,
      'plan', 'free',
      'quran_plan', 'free',
      'has_trial_access', FALSE,
      'trial_exhausted', TRUE,
      'trial_days_total', 2,
      'seconds_remaining', 0,
      'unlimited', FALSE,
      'error', 'Authentication required for Quran trial access'
    );
  END IF;

  -- 2. Check authoritative subscriptions table ledger
  IF EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = v_uid
      AND status = 'active'
      AND current_period_end > v_now
      AND (
        plan IN ('pro', 'premium') OR
        plan_id IN ('pro', 'premium', 'plan_pro', 'plan_premium')
      )
  ) THEN
    v_is_paid := TRUE;
    SELECT CASE 
      WHEN plan = 'premium' OR plan_id ILIKE '%premium%' THEN 'premium'
      ELSE 'pro'
    END INTO v_plan
    FROM public.subscriptions
    WHERE user_id = v_uid AND status = 'active' AND current_period_end > v_now
    ORDER BY current_period_end DESC LIMIT 1;
    v_quran_plan := v_plan;
  ELSE
    -- Check profiles table fallback
    SELECT plan, quran_plan, quran_trial_started_at, quran_trial_expires_at, plan_expires_at
    INTO v_plan, v_quran_plan, v_started_at, v_expires_at
    FROM public.profiles WHERE id = v_uid;

    IF v_plan IN ('pro', 'premium') AND (plan_expires_at IS NULL OR plan_expires_at > v_now) THEN
      v_is_paid := TRUE;
      v_quran_plan := v_plan;
    END IF;
  END IF;

  -- 3. Paid Member or Admin -> Unlimited Access
  IF v_is_paid OR public.is_admin() THEN
    RETURN jsonb_build_object(
      'authenticated', TRUE,
      'user_id', v_uid,
      'is_paid_member', TRUE,
      'plan', COALESCE(v_plan, 'pro'),
      'quran_plan', COALESCE(v_quran_plan, v_plan, 'pro'),
      'has_trial_access', TRUE,
      'trial_exhausted', FALSE,
      'unlimited', TRUE
    );
  END IF;

  -- 4. Free User: Check 2-Day Trial Window
  -- If trial has not started yet, automatically initialize it so the 2-day period begins
  IF v_started_at IS NULL THEN
    v_started_at := v_now;
    v_expires_at := v_now + INTERVAL '2 days';

    UPDATE public.profiles
    SET
      quran_plan = 'trial',
      quran_trial_started_at = v_started_at,
      quran_trial_expires_at = v_expires_at,
      updated_at = v_now
    WHERE id = v_uid;
  END IF;

  -- Calculate remaining trial time
  IF v_now < v_expires_at THEN
    v_has_access := TRUE;
    v_exhausted := FALSE;
    v_seconds_rem := GREATEST(0, EXTRACT(EPOCH FROM (v_expires_at - v_now))::INT);
  ELSE
    v_has_access := FALSE;
    v_exhausted := TRUE;
    v_seconds_rem := 0;

    -- Update profile status if still marked trial
    IF v_quran_plan = 'trial' THEN
      UPDATE public.profiles SET quran_plan = 'expired', updated_at = v_now WHERE id = v_uid;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'authenticated', TRUE,
    'user_id', v_uid,
    'is_paid_member', FALSE,
    'plan', 'free',
    'quran_plan', CASE WHEN v_has_access THEN 'trial' ELSE 'expired' END,
    'trial_days_total', 2,
    'trial_started_at', v_started_at,
    'trial_expires_at', v_expires_at,
    'seconds_remaining', v_seconds_rem,
    'has_trial_access', v_has_access,
    'trial_exhausted', v_exhausted,
    'unlimited', FALSE
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_quran_access_status(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quran_access_status(UUID) TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 7. Atomic Plan Activation RPC: update_plan_request_status
-- Idempotent, robust approval and activation with bundled Quran entitlements
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
  ELSIF p_status = 'rejected' THEN
    v_verified := FALSE;
  ELSE
    v_verified := COALESCE(v_req.payment_verified, FALSE);
  END IF;

  -- 5. Extract exact requested plan (Allowlist: pro, premium)
  v_plan := lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'pro')));
  IF v_plan NOT IN ('pro', 'premium') THEN
    v_plan := 'pro';
  END IF;

  -- Extract billing interval ('monthly' vs 'yearly')
  v_interval := lower(trim(COALESCE(v_req.billing_interval, 'monthly')));
  IF v_interval NOT IN ('monthly', 'yearly') THEN
    v_interval := 'monthly';
  END IF;

  -- Expected prices:
  -- AI Pro: $5.99/mo, $50.99/yr
  -- AI Premium: $20.99/mo, $75.99/yr
  IF v_plan = 'premium' THEN
    IF v_interval = 'yearly' THEN
      v_price := 75.99;
    ELSE
      v_price := 20.99;
    END IF;
  ELSE
    IF v_interval = 'yearly' THEN
      v_price := 50.99;
    ELSE
      v_price := 5.99;
    END IF;
  END IF;

  -- 6. Enforce payment verification before allowing approval/completion
  -- An unverified payment CANNOT activate a paid subscription
  IF p_status IN ('approved', 'completed') AND v_verified IS NOT TRUE THEN
    RAISE EXCEPTION 'Cannot activate % plan for request %: Payment verification is required before approval and activation.',
      upper(v_plan), v_req.reference_id;
  END IF;

  -- 7. Resolve target user ID
  v_user_id := v_req.user_id;

  -- Verify that existing v_user_id exists in auth.users
  IF v_user_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
      v_user_id := NULL;
    END IF;
  END IF;

  -- If not resolved yet, look up in auth.users by email
  IF v_user_id IS NULL AND v_req.email IS NOT NULL AND trim(v_req.email) <> '' THEN
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE lower(email) = lower(trim(v_req.email)) 
    LIMIT 1;
  END IF;

  -- 8. Return clear error if request cannot be associated with a real user account
  -- An unlinked request CANNOT activate a plan
  IF p_status IN ('approved', 'completed') AND v_user_id IS NULL THEN
    RAISE EXCEPTION 'Cannot activate % plan: Request % has no associated registered user account (email: "%"). The applicant must register an account first before approval can activate their subscription.',
      upper(v_plan), v_req.reference_id, COALESCE(v_req.email, 'unknown');
  END IF;

  -- 9. Calculate exact duration: 30 days for monthly, 365 days for annual
  IF v_interval = 'yearly' THEN
    v_period_end := v_now + INTERVAL '365 days';
  ELSE
    v_period_end := v_now + INTERVAL '30 days';
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
    price_amount = v_price,
    currency = 'USD',
    admin_notes = COALESCE(p_admin_notes, public.plan_requests.admin_notes),
    updated_at = v_now
  WHERE id = p_request_id;

  -- 11. If status is approved or completed, activate plan in profiles and record subscription
  IF p_status IN ('approved', 'completed') AND v_user_id IS NOT NULL THEN
    -- A. Update user profile to the exact requested plan with bundled Quran entitlement
    -- AI Pro automatically includes Quran Pro; AI Premium automatically includes Quran Premium
    UPDATE public.profiles
    SET
      plan = v_plan,
      quran_plan = v_plan,
      plan_activated_at = v_now,
      plan_expires_at = v_period_end,
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
        v_interval,
        v_now,
        v_now
      )
      ON CONFLICT (id) DO UPDATE SET
        plan = v_plan,
        quran_plan = v_plan,
        plan_activated_at = v_now,
        plan_expires_at = v_period_end,
        billing_interval = v_interval,
        updated_at = v_now;
    END IF;

    -- B. Record in subscriptions table exactly once in this transaction
    -- Cancel any previously active subscriptions for this user to avoid duplicate active subscriptions
    UPDATE public.subscriptions
    SET status = 'canceled', updated_at = v_now
    WHERE user_id = v_user_id AND status = 'active';

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
      v_now
    );

    -- C. Persistent Somali In-App Congratulatory Notification
    -- Idempotent: Only insert if not already notified for this request ID
    DECLARE
      v_plan_label TEXT := CASE WHEN v_plan = 'premium' THEN 'Premium' ELSE 'Pro' END;
      v_duration_label TEXT := CASE WHEN v_interval = 'yearly' THEN 'sanad' ELSE 'bil' END;
    BEGIN
      v_notif_message := 'Hambalyo! Waxaad heshay subscription-kaaga ' || v_plan_label || ' muddo ' || v_duration_label || ' ah. Ku raaxayso adeegga EMufti AI.';
      IF v_interval = 'yearly' THEN
        v_notif_title := 'Hambalyo! Subscription-kaaga sanadlaha ah waa la kiciyay (' || upper(v_plan) || ')';
      ELSE
        v_notif_title := 'Hambalyo! Subscription-kaaga bisha ah waa la kiciyay (' || upper(v_plan) || ')';
      END IF;
    END;

    INSERT INTO public.user_notifications (
      user_id,
      title,
      message,
      type,
      metadata,
      is_read,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      v_notif_title,
      v_notif_message,
      'plan_activation',
      jsonb_build_object(
        'request_id', p_request_id,
        'reference_id', v_req.reference_id,
        'plan', v_plan,
        'quran_plan', v_plan,
        'billing_interval', v_interval,
        'start_date', v_now,
        'expires_at', v_period_end,
        'price_amount', v_price
      ),
      FALSE,
      v_now,
      v_now
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- 12. Return detailed success JSON payload
  RETURN jsonb_build_object(
    'success', TRUE,
    'request_id', p_request_id,
    'reference_id', v_req.reference_id,
    'status', p_status,
    'payment_verified', v_verified,
    'user_id', v_user_id,
    'plan', CASE WHEN p_status IN ('approved', 'completed') THEN v_plan ELSE NULL END,
    'quran_plan', CASE WHEN p_status IN ('approved', 'completed') THEN v_plan ELSE NULL END,
    'billing_interval', v_interval,
    'price_amount', v_price,
    'current_period_start', v_now,
    'current_period_end', v_period_end,
    'plan_activated', (p_status IN ('approved', 'completed') AND v_user_id IS NOT NULL),
    'updated_at', v_now
  );
END;
$$;

REVOKE ALL ON FUNCTION public.update_plan_request_status(UUID, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_plan_request_status(UUID, TEXT, TEXT, BOOLEAN) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 8. Sync and Expiration RPC: sync_user_plan_entitlements
-- Idempotently audits subscriptions and expires subscriptions past their period end
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

  -- 1. Mark expired active subscriptions as 'expired'
  UPDATE public.subscriptions
  SET status = 'expired', updated_at = v_now
  WHERE user_id = v_uid AND status = 'active' AND current_period_end <= v_now;
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  -- 2. Check if user still has a valid active subscription
  SELECT * INTO v_sub
  FROM public.subscriptions
  WHERE user_id = v_uid AND status = 'active' AND current_period_end > v_now
  ORDER BY current_period_end DESC
  LIMIT 1;

  IF v_sub IS NOT NULL THEN
    UPDATE public.profiles
    SET
      plan = v_sub.plan,
      quran_plan = v_sub.plan,
      plan_activated_at = v_sub.current_period_start,
      plan_expires_at = v_sub.current_period_end,
      billing_interval = v_sub.billing_interval,
      updated_at = v_now
    WHERE id = v_uid;

    RETURN jsonb_build_object(
      'success', TRUE,
      'has_active_subscription', TRUE,
      'plan', v_sub.plan,
      'quran_plan', v_sub.plan,
      'billing_interval', v_sub.billing_interval,
      'plan_expires_at', v_sub.current_period_end
    );
  ELSE
    -- If no active subscription remains, revert profile to free tier
    UPDATE public.profiles
    SET
      plan = 'free',
      quran_plan = CASE WHEN quran_plan IN ('pro', 'premium') THEN 'expired' ELSE quran_plan END,
      updated_at = v_now
    WHERE id = v_uid AND plan IN ('pro', 'premium');

    RETURN jsonb_build_object(
      'success', TRUE,
      'has_active_subscription', FALSE,
      'plan', 'free',
      'quran_plan', 'free',
      'expired_subscriptions', v_expired_count
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_user_plan_entitlements() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_user_plan_entitlements() TO authenticated, service_role;
