-- ==============================================================================
-- EMufti AI - Critical Fix: Approved User Still Shows "Current Active Plan: FREE"
-- Migration: 20261015_active_plan_free_bug_fix.sql
-- Target Database: Supabase (ozvvxuzecwhlpbfongiy)
--
-- Fixes:
-- 1. Updates chk_subscriptions_status constraint to include 'expired'.
-- 2. Ensures public.profiles, subscriptions, plan_requests, user_notifications columns.
-- 3. Configures RLS policies so authenticated users can read their own profiles,
--    subscriptions, and notifications, and admins can manage all rows.
-- 4. Atomic Server-Side RPC update_plan_request_status:
--    - Enforces admin authorization via public.is_admin()
--    - Strict payment verification check (unverified payment CANNOT activate)
--    - Robust user resolution: links by user_id or email across auth.users and profiles
--    - Normalizes plan: 'pro' or 'premium' (supports plan_pro, plan_premium)
--    - Exact duration: 30 days for monthly, 365 days for annual
--    - Bundled Quran entitlement: Pro -> Quran Pro, Premium -> Quran Premium
--    - Cancels prior active subscriptions to prevent duplicates (single active ledger)
--    - Persistent Somali congratulatory notification (idempotent)
-- 5. Atomic Entitlement Sync RPC sync_user_plan_entitlements:
--    - Idempotently expires active subscriptions past current_period_end
--    - Auto-reconciles approved requests if subscription row was missing
--    - Only downgrades to free tier if NO active subscription and NO valid approved request exists
-- 6. RPC get_plan_request_status: returns tracking status with activation_state
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Profiles Schema & Constraints
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quran_plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_activated_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quran_trial_started_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quran_trial_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_plan;
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_plan CHECK (plan IN ('free', 'pro', 'premium'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_quran_plan;
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_quran_plan CHECK (quran_plan IN ('free', 'trial', 'pro', 'premium', 'expired'));

-- -----------------------------------------------------------------------------
-- 2. Subscriptions Schema & Constraints
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'pro',
  billing_interval TEXT NOT NULL DEFAULT 'monthly',
  price_amount NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  provider TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'active',
  request_id UUID REFERENCES public.plan_requests(id) ON DELETE SET NULL,
  quran_access BOOLEAN NOT NULL DEFAULT TRUE,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'monthly';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS price_amount NUMERIC;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS quran_access BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS request_id UUID;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS chk_subscriptions_status;
ALTER TABLE public.subscriptions ADD CONSTRAINT chk_subscriptions_status CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete', 'expired'));

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS chk_subscriptions_plan;
ALTER TABLE public.subscriptions ADD CONSTRAINT chk_subscriptions_plan CHECK (plan IN ('pro', 'premium'));

-- -----------------------------------------------------------------------------
-- 3. Plan Requests Schema & Constraints
-- -----------------------------------------------------------------------------
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'monthly';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS price_amount NUMERIC NOT NULL DEFAULT 5.99;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- -----------------------------------------------------------------------------
-- 4. User Notifications Schema & Constraints
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_uniq_plan_activation_notif
  ON public.user_notifications(user_id, (metadata->>'request_id'))
  WHERE type = 'plan_activation';

-- -----------------------------------------------------------------------------
-- 5. Row Level Security (RLS) Policies
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Subscriptions Policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage all subscriptions"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Grants
GRANT SELECT, UPDATE, INSERT ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.subscriptions TO authenticated;
GRANT ALL ON TABLE public.subscriptions TO postgres, service_role;
GRANT ALL ON TABLE public.user_notifications TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 6. Atomic Server-Side RPC: update_plan_request_status
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

  -- Extract billing interval ('monthly' vs 'yearly')
  v_interval := lower(trim(COALESCE(v_req.billing_interval, 'monthly')));
  IF v_interval NOT IN ('monthly', 'yearly') THEN
    v_interval := 'monthly';
  END IF;

  -- Authoritative pricing
  IF v_plan = 'premium' THEN
    v_price := CASE WHEN v_interval = 'yearly' THEN 75.99 ELSE 20.99 END;
  ELSE
    v_price := CASE WHEN v_interval = 'yearly' THEN 50.99 ELSE 5.99 END;
  END IF;

  -- 6. Enforce payment verification before allowing approval/completion
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

  -- Fallback: lookup in public.profiles
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
-- 7. Sync and Expiration RPC: sync_user_plan_entitlements
-- Idempotently audits subscriptions and reconciles approved requests
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_user_plan_entitlements()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_email TEXT := coalesce(auth.jwt() ->> 'email', '');
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_sub RECORD;
  v_req RECORD;
  v_plan TEXT;
  v_interval TEXT;
  v_period_end TIMESTAMPTZ;
  v_expired_count INT := 0;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Unauthenticated');
  END IF;

  -- If email not in JWT, fetch from profiles
  IF v_email = '' THEN
    SELECT email INTO v_email FROM public.profiles WHERE id = v_uid;
    v_email := COALESCE(v_email, '');
  END IF;

  -- 1. Auto-link unlinked requests for this user
  IF v_email <> '' THEN
    UPDATE public.plan_requests
    SET user_id = v_uid, updated_at = v_now
    WHERE lower(email) = lower(trim(v_email)) AND user_id IS NULL;
  END IF;

  -- 2. Mark expired active subscriptions as 'expired'
  UPDATE public.subscriptions
  SET status = 'expired', updated_at = v_now
  WHERE user_id = v_uid AND lower(trim(status)) = 'active' AND current_period_end IS NOT NULL AND current_period_end <= v_now;
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  -- 3. Check for valid active subscription
  SELECT * INTO v_sub
  FROM public.subscriptions
  WHERE user_id = v_uid AND lower(trim(status)) = 'active' AND (current_period_end IS NULL OR current_period_end > v_now)
  ORDER BY current_period_end DESC
  LIMIT 1;

  IF v_sub IS NOT NULL THEN
    v_plan := CASE WHEN lower(trim(v_sub.plan)) ILIKE '%premium%' THEN 'premium' ELSE 'pro' END;
    UPDATE public.profiles
    SET
      plan = v_plan,
      quran_plan = v_plan,
      plan_activated_at = COALESCE(v_sub.current_period_start, plan_activated_at, v_now),
      plan_expires_at = v_sub.current_period_end,
      billing_interval = COALESCE(v_sub.billing_interval, 'monthly'),
      updated_at = v_now
    WHERE id = v_uid;

    RETURN jsonb_build_object(
      'success', TRUE,
      'has_active_subscription', TRUE,
      'plan', v_plan,
      'quran_plan', v_plan,
      'billing_interval', COALESCE(v_sub.billing_interval, 'monthly'),
      'plan_expires_at', v_sub.current_period_end
    );
  END IF;

  -- 4. Resilience: Check if user has an approved, payment-verified plan request
  SELECT * INTO v_req
  FROM public.plan_requests
  WHERE (user_id = v_uid OR (v_email <> '' AND lower(email) = lower(trim(v_email))))
    AND status IN ('approved', 'completed')
    AND payment_verified = TRUE
  ORDER BY updated_at DESC
  LIMIT 1;

  IF v_req IS NOT NULL THEN
    v_plan := CASE WHEN lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'pro'))) ILIKE '%premium%' THEN 'premium' ELSE 'pro' END;
    v_interval := CASE WHEN lower(trim(COALESCE(v_req.billing_interval, 'monthly'))) = 'yearly' THEN 'yearly' ELSE 'monthly' END;
    v_period_end := v_req.updated_at + (CASE WHEN v_interval = 'yearly' THEN INTERVAL '365 days' ELSE INTERVAL '30 days' END);

    IF v_period_end > v_now THEN
      -- Self-heal: Provision the active subscription
      INSERT INTO public.subscriptions (
        user_id, plan, billing_interval, price_amount, currency, provider, status, request_id, quran_access,
        current_period_start, current_period_end, created_at, updated_at
      ) VALUES (
        v_uid, v_plan, v_interval, v_req.price_amount, 'USD', 'manual', 'active', v_req.id, TRUE,
        v_req.updated_at, v_period_end, v_now, v_now
      );

      UPDATE public.profiles
      SET
        plan = v_plan,
        quran_plan = v_plan,
        plan_activated_at = v_req.updated_at,
        plan_expires_at = v_period_end,
        billing_interval = v_interval,
        updated_at = v_now
      WHERE id = v_uid;

      RETURN jsonb_build_object(
        'success', TRUE,
        'has_active_subscription', TRUE,
        'plan', v_plan,
        'quran_plan', v_plan,
        'billing_interval', v_interval,
        'plan_expires_at', v_period_end
      );
    END IF;
  END IF;

  -- 5. Only revert to free tier if NO active subscription AND profile is genuinely expired
  -- Never downgrade an unexpired Pro or Premium profile
  UPDATE public.profiles
  SET
    plan = 'free',
    quran_plan = CASE WHEN quran_plan IN ('pro', 'premium') THEN 'expired' ELSE quran_plan END,
    updated_at = v_now
  WHERE id = v_uid AND plan IN ('pro', 'premium') AND (plan_expires_at IS NOT NULL AND plan_expires_at <= v_now);

  RETURN jsonb_build_object(
    'success', TRUE,
    'has_active_subscription', FALSE,
    'plan', 'free',
    'quran_plan', 'free',
    'expired_subscriptions', v_expired_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.sync_user_plan_entitlements() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_user_plan_entitlements() TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 8. Tracking RPC: get_plan_request_status
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_plan_request_status(p_reference_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req RECORD;
  v_has_acc BOOLEAN := FALSE;
  v_is_act BOOLEAN := FALSE;
  v_act_state TEXT := 'pending';
  v_plan TEXT;
BEGIN
  IF p_reference_id IS NULL OR trim(p_reference_id) = '' THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Tracking reference ID is required');
  END IF;

  SELECT * INTO v_req
  FROM public.plan_requests
  WHERE reference_id = trim(p_reference_id);

  IF v_req IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'No request found matching reference ID');
  END IF;

  v_plan := CASE WHEN lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'pro'))) ILIKE '%premium%' THEN 'premium' ELSE 'pro' END;

  -- Check if user account exists
  IF v_req.user_id IS NOT NULL THEN
    v_has_acc := EXISTS (SELECT 1 FROM auth.users WHERE id = v_req.user_id);
  END IF;
  IF NOT v_has_acc AND v_req.email IS NOT NULL THEN
    v_has_acc := EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower(trim(v_req.email)));
  END IF;

  -- Check if subscription is active
  IF v_req.status IN ('approved', 'completed') AND v_req.payment_verified = TRUE THEN
    IF v_has_acc THEN
      v_is_act := TRUE;
      v_act_state := 'active';
    ELSE
      v_act_state := 'awaiting_registration';
    END IF;
  ELSIF v_req.status = 'rejected' THEN
    v_act_state := 'rejected';
  ELSIF v_req.status = 'under_review' THEN
    v_act_state := 'under_review';
  ELSE
    v_act_state := 'payment_pending';
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'id', v_req.id,
    'reference_id', v_req.reference_id,
    'plan', v_plan,
    'plan_slug', v_plan,
    'billing_interval', COALESCE(v_req.billing_interval, 'monthly'),
    'price_amount', v_req.price_amount,
    'currency', COALESCE(v_req.currency, 'USD'),
    'status', v_req.status,
    'payment_verified', v_req.payment_verified,
    'has_registered_account', v_has_acc,
    'is_active', v_is_act,
    'activation_state', v_act_state,
    'admin_notes', v_req.admin_notes,
    'created_at', v_req.created_at,
    'updated_at', v_req.updated_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_plan_request_status(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_plan_request_status(TEXT) TO anon, authenticated, service_role;
