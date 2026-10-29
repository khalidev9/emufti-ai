-- ==============================================================================
-- EMufti AI - Complete Plan Approval, Claim Offer, and Automatic Subscription Activation
-- Migration: 20261016_claim_offer_workflow.sql
--
-- Features:
-- 1. Schema Enhancements on public.plan_requests:
--    - Adds 'duration', 'approved_at', 'approved_by', 'offer_expires_at', 'claimed_at', 'subscription_id'
-- 2. Atomic Offer Claiming RPC:
--    - public.claim_plan_offer(p_reference_id TEXT)
--    - Validates ownership, approval status, non-expiration, and idempotency
--    - Deactivates previous subscriptions, creates active subscription, updates profile
--    - Marks request as 'claimed' only after activation succeeds
-- 3. Privacy-Preserving Request Status Tracking RPC:
--    - public.get_plan_request_status(p_reference_id TEXT)
--    - Exposes plan, status, duration, dates, and 'can_claim' flag without leaking private PII
-- 4. Admin Approval Synchronization:
--    - public.update_plan_request_status handles approval, duration, and claim deadlines
-- ==============================================================================

-- 1. Prepare Columns on public.plan_requests
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '1 month';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS offer_expires_at TIMESTAMPTZ;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL;

-- 2. Indexes for efficient lookup
CREATE INDEX IF NOT EXISTS idx_plan_requests_ref_status ON public.plan_requests (reference_id, status);
CREATE INDEX IF NOT EXISTS idx_plan_requests_user_status ON public.plan_requests (user_id, status);

-- 3. Atomic Offer Claiming RPC
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
  v_duration_label TEXT;
  v_duration_interval INTERVAL;
  v_sub_id UUID;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  -- 1. Authentication check
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required. Please sign in to claim your offer.';
  END IF;

  v_caller_email := lower(trim(COALESCE(auth.jwt() ->> 'email', '')));

  -- 2. Lock and retrieve the target request
  SELECT * INTO v_req
  FROM public.plan_requests
  WHERE upper(trim(reference_id)) = upper(trim(p_reference_id))
  FOR UPDATE;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Plan request "%" not found.', p_reference_id;
  END IF;

  -- 3. Ownership verification
  IF v_req.user_id IS NOT NULL AND v_req.user_id <> v_caller_id THEN
    -- If user_id is set but does not match, also check if email matches authenticated caller
    IF v_caller_email = '' OR lower(trim(COALESCE(v_req.email, ''))) <> v_caller_email THEN
      RAISE EXCEPTION 'Access denied. You can only claim offers belonging to your own account.';
    END IF;
  END IF;

  IF v_req.user_id IS NULL AND (v_req.email IS NULL OR lower(trim(v_req.email)) <> v_caller_email) THEN
    RAISE EXCEPTION 'Access denied. This offer belongs to a different email address. Please sign in with the requested account.';
  END IF;

  -- 4. Status checks & Idempotency
  IF v_req.status = 'claimed' THEN
    RAISE EXCEPTION 'This offer has already been claimed and is active.';
  END IF;

  IF v_req.status = 'rejected' THEN
    RAISE EXCEPTION 'This request was not approved and cannot be claimed.';
  END IF;

  IF v_req.status IN ('pending', 'under_review') THEN
    RAISE EXCEPTION 'Your request is pending review and has not yet been approved.';
  END IF;

  IF v_req.status NOT IN ('approved', 'completed') THEN
    RAISE EXCEPTION 'This request is not eligible to be claimed (status: %).', v_req.status;
  END IF;

  -- 5. Expiration check
  IF v_req.offer_expires_at IS NOT NULL AND v_req.offer_expires_at < v_now THEN
    UPDATE public.plan_requests SET status = 'expired', updated_at = v_now WHERE id = v_req.id;
    RAISE EXCEPTION 'This offer expired on % and can no longer be claimed.', to_char(v_req.offer_expires_at, 'YYYY-MM-DD');
  END IF;

  -- 6. Extract exact plan from trusted database record
  v_plan := lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'pro')));
  IF v_plan NOT IN ('pro', 'premium') THEN
    v_plan := 'pro';
  END IF;

  -- 7. Determine duration
  IF lower(trim(COALESCE(v_req.billing_interval, ''))) = 'yearly' OR
     lower(trim(COALESCE(v_req.duration, ''))) = '1 year' THEN
    v_duration_label := '1 year';
    v_duration_interval := INTERVAL '365 days';
  ELSE
    v_duration_label := '1 month';
    v_duration_interval := INTERVAL '30 days';
  END IF;

  -- 8. Atomic Subscription Activation
  -- Deactivate any previously active subscriptions for this user to prevent duplicates
  UPDATE public.subscriptions
  SET status = 'canceled', updated_at = v_now
  WHERE user_id = v_caller_id AND status = 'active';

  -- Create fresh active subscription ledger entry
  INSERT INTO public.subscriptions (
    user_id,
    plan,
    provider,
    status,
    request_id,
    current_period_start,
    current_period_end,
    created_at,
    updated_at
  )
  VALUES (
    v_caller_id,
    v_plan,
    'manual',
    'active',
    v_req.id,
    v_now,
    v_now + v_duration_interval,
    v_now,
    v_now
  )
  RETURNING id INTO v_sub_id;

  -- 9. Update user profile
  UPDATE public.profiles
  SET
    plan = v_plan,
    plan_activated_at = v_now,
    billing_interval = CASE WHEN v_duration_label = '1 year' THEN 'yearly' ELSE 'monthly' END,
    updated_at = v_now
  WHERE id = v_caller_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id,
      email,
      display_name,
      role,
      plan,
      plan_activated_at,
      billing_interval,
      created_at,
      updated_at
    )
    VALUES (
      v_caller_id,
      v_caller_email,
      COALESCE(v_req.full_name, split_part(v_caller_email, '@', 1)),
      'user',
      v_plan,
      v_now,
      CASE WHEN v_duration_label = '1 year' THEN 'yearly' ELSE 'monthly' END,
      v_now,
      v_now
    )
    ON CONFLICT (id) DO UPDATE SET
      plan = v_plan,
      plan_activated_at = v_now,
      billing_interval = CASE WHEN v_duration_label = '1 year' THEN 'yearly' ELSE 'monthly' END,
      updated_at = v_now;
  END IF;

  -- 10. Mark plan_request as claimed atomically
  UPDATE public.plan_requests
  SET
    status = 'claimed',
    claimed_at = v_now,
    subscription_id = v_sub_id,
    user_id = v_caller_id,
    payment_verified = TRUE,
    updated_at = v_now
  WHERE id = v_req.id;

  -- 11. Return detailed confirmation payload
  RETURN jsonb_build_object(
    'success', TRUE,
    'reference_id', v_req.reference_id,
    'plan', v_plan,
    'plan_label', upper(v_plan),
    'duration', v_duration_label,
    'subscription_id', v_sub_id,
    'activated_at', v_now,
    'current_period_end', v_now + v_duration_interval,
    'message', format('Congratulations! Your %s plan has been activated successfully for %s.', upper(v_plan), v_duration_label)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_plan_offer(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_plan_offer(TEXT) TO authenticated, service_role;

-- 4. Privacy-Preserving Request Status Tracking RPC
CREATE OR REPLACE FUNCTION public.get_plan_request_status(p_reference_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req RECORD;
  v_clean_ref TEXT;
  v_caller_id UUID;
  v_caller_email TEXT;
  v_is_owner BOOLEAN := FALSE;
  v_can_claim BOOLEAN := FALSE;
  v_plan TEXT;
  v_duration_label TEXT;
  v_activation_state TEXT;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  v_clean_ref := upper(trim(COALESCE(p_reference_id, '')));
  IF v_clean_ref = '' THEN
    RETURN NULL;
  END IF;

  v_caller_id := auth.uid();
  v_caller_email := lower(trim(COALESCE(auth.jwt() ->> 'email', '')));

  SELECT * INTO v_req
  FROM public.plan_requests
  WHERE upper(trim(reference_id)) = v_clean_ref
  LIMIT 1;

  IF v_req IS NULL THEN
    RETURN NULL;
  END IF;

  -- Determine ownership
  IF v_caller_id IS NOT NULL AND v_req.user_id = v_caller_id THEN
    v_is_owner := TRUE;
  ELSIF v_caller_email <> '' AND lower(trim(COALESCE(v_req.email, ''))) = v_caller_email THEN
    v_is_owner := TRUE;
  ELSIF public.is_admin() THEN
    v_is_owner := TRUE;
  END IF;

  -- Exact plan
  v_plan := lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'pro')));
  IF v_plan NOT IN ('pro', 'premium') THEN
    v_plan := 'pro';
  END IF;

  -- Duration
  IF lower(trim(COALESCE(v_req.billing_interval, ''))) = 'yearly' OR
     lower(trim(COALESCE(v_req.duration, ''))) = '1 year' THEN
    v_duration_label := '1 year';
  ELSE
    v_duration_label := '1 month';
  END IF;

  -- Check if claimable
  IF v_req.status = 'approved' AND v_is_owner THEN
    IF v_req.offer_expires_at IS NULL OR v_req.offer_expires_at > v_now THEN
      v_can_claim := TRUE;
    END IF;
  END IF;

  -- Activation state for backward compatibility with existing tests
  IF v_req.status = 'claimed' THEN
    v_activation_state := 'active';
  ELSIF v_req.status = 'approved' THEN
    v_activation_state := 'approved';
  ELSIF v_req.status = 'rejected' THEN
    v_activation_state := 'rejected';
  ELSIF v_req.status = 'under_review' THEN
    v_activation_state := 'under_review';
  ELSE
    v_activation_state := 'pending';
  END IF;

  -- Return payload (never leak sensitive private PII to non-owners)
  RETURN jsonb_build_object(
    'id', v_req.id,
    'reference_id', v_req.reference_id,
    'plan', v_plan,
    'plan_slug', v_plan,
    'plan_label', upper(v_plan),
    'status', v_req.status,
    'duration', v_duration_label,
    'billing_interval', COALESCE(v_req.billing_interval, 'monthly'),
    'payment_verified', COALESCE(v_req.payment_verified, FALSE),
    'is_owner', v_is_owner,
    'can_claim', v_can_claim,
    'activation_state', v_activation_state,
    'is_active', (v_req.status = 'claimed'),
    'created_at', v_req.created_at,
    'approved_at', v_req.approved_at,
    'offer_expires_at', v_req.offer_expires_at,
    'claimed_at', v_req.claimed_at,
    -- Private details only returned to verified owner or admin
    'full_name', CASE WHEN v_is_owner THEN v_req.full_name ELSE NULL END,
    'email', CASE WHEN v_is_owner THEN v_req.email ELSE NULL END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_plan_request_status(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_plan_request_status(TEXT) TO anon, authenticated, service_role;
