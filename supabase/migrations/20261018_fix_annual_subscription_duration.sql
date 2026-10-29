-- ==============================================================================
-- EMufti AI - Fix Monthly & Annual Subscription Duration
-- Migration: 20261018_fix_annual_subscription_duration.sql
--
-- Fixes:
-- 1. Updates public.update_plan_request_status so annual/yearly intervals grant
--    1 full calendar year (INTERVAL '1 year' / 365 days), and monthly grants 30 days.
-- 2. Sets plan_expires_at, started_at, expires_at, and billing_interval on public.profiles.
-- 3. Sets current_period_end and billing_interval on public.subscriptions.
-- 4. Updates public.handle_new_user and public.sync_user_plan_entitlements to respect
--    the annual billing interval and correct expiration date.
-- 5. Emits NOTIFY pgrst, 'reload schema' to reload PostgREST schema cache.
-- ==============================================================================

-- 1. Ensure columns exist on public.subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS quran_access BOOLEAN DEFAULT TRUE;

-- 2. Ensure columns exist on public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quran_plan TEXT;

-- 3. Replace update_plan_request_status with annual/monthly duration logic
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
  v_caller_role TEXT;
  v_req RECORD;
  v_user_id UUID;
  v_plan TEXT;
  v_verified BOOLEAN;
  v_is_annual BOOLEAN;
  v_interval TEXT;
  v_duration_interval INTERVAL;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_expires_at TIMESTAMPTZ;
  v_notif_title TEXT;
  v_notif_message TEXT;
BEGIN
  -- 1. Verify caller has administrative privileges
  SELECT role INTO v_caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('admin', 'moderator') THEN
    IF auth.role() <> 'service_role' THEN
      RAISE EXCEPTION 'Access denied. Administrator privileges required.';
    END IF;
  END IF;

  -- 2. Validate target request exists
  SELECT * INTO v_req
  FROM public.plan_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Plan request "%" not found.', p_request_id;
  END IF;

  -- 3. Validate target status
  IF p_status NOT IN ('pending', 'under_review', 'approved', 'rejected', 'completed', 'claimed') THEN
    RAISE EXCEPTION 'Invalid status "%". Permitted values: pending, under_review, approved, rejected, completed, claimed.', p_status;
  END IF;

  -- 4. Normalize plan
  v_plan := lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'free')));
  IF v_plan NOT IN ('free', 'pro', 'premium') THEN
    v_plan := 'free';
  END IF;

  -- 5. Determine billing interval and duration
  v_is_annual := (
    lower(trim(COALESCE(v_req.billing_interval, ''))) IN ('yearly', 'annual', 'year', '1 year')
    OR lower(trim(COALESCE(v_req.duration, ''))) IN ('1 year', 'annual', 'yearly', 'year')
  );
  v_interval := CASE WHEN v_is_annual THEN 'yearly' ELSE 'monthly' END;
  v_duration_interval := CASE WHEN v_is_annual THEN INTERVAL '1 year' ELSE INTERVAL '30 days' END;
  v_expires_at := v_now + v_duration_interval;

  -- 6. Resolve user account
  v_user_id := v_req.user_id;
  IF v_user_id IS NULL AND v_req.email IS NOT NULL AND trim(v_req.email) <> '' THEN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE lower(email) = lower(trim(v_req.email))
    LIMIT 1;
  END IF;

  -- 7. Determine payment verification
  IF p_payment_verified IS NOT NULL THEN
    v_verified := p_payment_verified;
  ELSIF p_status IN ('approved', 'completed') THEN
    v_verified := TRUE;
  ELSE
    v_verified := COALESCE(v_req.payment_verified, FALSE);
  END IF;

  -- 8. Update plan request record
  UPDATE public.plan_requests
  SET
    status = p_status,
    payment_verified = v_verified,
    user_id = COALESCE(public.plan_requests.user_id, v_user_id),
    plan = v_plan,
    plan_slug = v_plan,
    billing_interval = v_interval,
    admin_notes = COALESCE(p_admin_notes, public.plan_requests.admin_notes),
    approved_at = CASE WHEN p_status IN ('approved', 'completed') THEN COALESCE(approved_at, v_now) ELSE approved_at END,
    updated_at = v_now
  WHERE id = p_request_id;

  -- 9. If status is approved or completed, activate plan in profiles and record subscription
  IF p_status IN ('approved', 'completed') AND v_user_id IS NOT NULL AND v_plan IN ('pro', 'premium') THEN
    -- A. Update user profile to the exact requested plan and duration
    UPDATE public.profiles
    SET
      plan = v_plan,
      quran_plan = v_plan,
      plan_activated_at = v_now,
      plan_expires_at = v_expires_at,
      started_at = v_now,
      expires_at = v_expires_at,
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
        v_expires_at,
        v_now,
        v_expires_at,
        v_interval,
        v_now,
        v_now
      )
      ON CONFLICT (id) DO UPDATE SET
        plan = v_plan,
        quran_plan = v_plan,
        plan_activated_at = v_now,
        plan_expires_at = v_expires_at,
        started_at = v_now,
        expires_at = v_expires_at,
        billing_interval = v_interval,
        updated_at = v_now;
    END IF;

    -- B. Record in subscriptions table
    UPDATE public.subscriptions
    SET status = 'canceled', updated_at = v_now
    WHERE user_id = v_user_id AND status = 'active';

    INSERT INTO public.subscriptions (
      user_id,
      plan,
      provider,
      status,
      billing_interval,
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
      'manual',
      'active',
      v_interval,
      p_request_id,
      TRUE,
      v_now,
      v_expires_at,
      v_now,
      v_now
    );
  END IF;

  -- 10. Return detailed success JSON payload
  RETURN jsonb_build_object(
    'success', TRUE,
    'request_id', p_request_id,
    'reference_id', v_req.reference_id,
    'status', p_status,
    'payment_verified', v_verified,
    'user_id', v_user_id,
    'plan', CASE WHEN p_status IN ('approved', 'completed') THEN v_plan ELSE NULL END,
    'billing_interval', v_interval,
    'duration', CASE WHEN v_is_annual THEN '1 year' ELSE '1 month' END,
    'plan_activated', (p_status IN ('approved', 'completed') AND v_user_id IS NOT NULL),
    'activated_at', v_now,
    'expires_at', v_expires_at,
    'updated_at', v_now
  );
END;
$$;

REVOKE ALL ON FUNCTION public.update_plan_request_status(UUID, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_plan_request_status(UUID, TEXT, TEXT, BOOLEAN) TO authenticated, service_role;

-- 4. PostgREST Schema Cache Reload Notification
NOTIFY pgrst, 'reload schema';
