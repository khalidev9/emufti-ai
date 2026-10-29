-- ==============================================================================
-- EMufti AI - Fix Claim Offer RPC & Schema Exposure
-- Migration: 20261018_fix_claim_plan_offer_rpc.sql
--
-- Fixes:
-- 1. Matches frontend RPC signature: public.claim_plan_offer(p_reference_id TEXT)
-- 2. Grants EXECUTE to anon, authenticated, and service_role so PostgREST exposes
--    the function in its schema cache to both unauthenticated and authenticated clients
-- 3. Enforces server-side authentication, applicant ownership, and atomic idempotency
-- 4. Derives approved plan and duration from public.plan_requests (never frontend)
-- 5. Atomically calculates exact calendar expiration (1 month or 1 year)
-- 6. Activates subscription in public.subscriptions and public.profiles
-- 7. Returns structured activation details including activated_at and expires_at
-- 8. Emits NOTIFY pgrst, 'reload schema' to immediately refresh PostgREST cache
-- ==============================================================================

-- 1. Ensure required columns exist on public.plan_requests
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '1 month';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS offer_expires_at TIMESTAMPTZ;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly';

-- 2. Ensure indexes exist for fast atomic row locking
CREATE INDEX IF NOT EXISTS idx_plan_requests_ref_status ON public.plan_requests (reference_id, status);
CREATE INDEX IF NOT EXISTS idx_plan_requests_user_status ON public.plan_requests (user_id, status);

-- 3. Create or replace public.claim_plan_offer RPC
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
  v_duration_somali TEXT;
  v_duration_interval INTERVAL;
  v_sub_id UUID;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_expires_at TIMESTAMPTZ;
  v_notif_title TEXT;
  v_notif_message TEXT;
BEGIN
  -- 1. Enforce authenticated caller
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required. Please sign in to claim your offer.';
  END IF;

  v_caller_email := lower(trim(COALESCE(auth.jwt() ->> 'email', '')));

  -- 2. Validate reference ID and acquire exclusive row lock
  IF p_reference_id IS NULL OR trim(p_reference_id) = '' THEN
    RAISE EXCEPTION 'Reference ID is required to claim an offer.';
  END IF;

  SELECT * INTO v_req
  FROM public.plan_requests
  WHERE upper(trim(reference_id)) = upper(trim(p_reference_id))
  FOR UPDATE;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Plan request "%" not found.', p_reference_id;
  END IF;

  -- 3. Ownership verification
  IF v_req.user_id IS NOT NULL AND v_req.user_id <> v_caller_id THEN
    -- If user_id is set but does not match, allow if authenticated caller's email matches the request email
    IF v_caller_email = '' OR lower(trim(COALESCE(v_req.email, ''))) <> v_caller_email THEN
      RAISE EXCEPTION 'Access denied. You can only claim offers belonging to your own account.';
    END IF;
  END IF;

  IF v_req.user_id IS NULL AND (v_req.email IS NULL OR lower(trim(v_req.email)) <> v_caller_email) THEN
    RAISE EXCEPTION 'Access denied. This offer belongs to a different email address. Please sign in with the requested account.';
  END IF;

  -- 4. Status checks & idempotency
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

  -- 6. Derive plan strictly from database (never trust client)
  IF lower(trim(COALESCE(v_req.plan_slug, v_req.plan, ''))) LIKE '%premium%' OR
     lower(trim(COALESCE(v_req.plan_slug, v_req.plan, ''))) LIKE '%alim%' THEN
    v_plan := 'premium';
  ELSE
    v_plan := 'pro';
  END IF;

  -- 7. Derive duration & billing interval strictly from database record
  v_is_annual := (
    lower(trim(COALESCE(v_req.billing_interval, ''))) IN ('yearly', 'annual', 'year', '1 year') OR
    lower(trim(COALESCE(v_req.duration, ''))) IN ('1 year', 'annual', 'yearly', 'year')
  );

  IF v_is_annual THEN
    v_interval := 'annual';
    v_duration_label := '1 year';
    v_duration_somali := '1 Sano';
    v_duration_interval := INTERVAL '1 year';
  ELSE
    v_interval := 'monthly';
    v_duration_label := '1 month';
    v_duration_somali := '1 Bil';
    v_duration_interval := INTERVAL '1 month';
  END IF;

  v_expires_at := v_now + v_duration_interval;

  -- 8. Atomically deactivate previous active subscriptions for caller
  UPDATE public.subscriptions
  SET status = 'canceled', updated_at = v_now
  WHERE user_id = v_caller_id AND status = 'active';

  -- 9. Insert new active subscription record
  INSERT INTO public.subscriptions (
    user_id,
    plan,
    provider,
    status,
    request_id,
    billing_interval,
    quran_access,
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
    TRUE,
    v_now,
    v_expires_at,
    v_now,
    v_expires_at,
    v_now,
    v_now
  )
  RETURNING id INTO v_sub_id;

  -- 10. Atomically update or insert user profile
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
  WHERE id = v_caller_id;

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
      v_caller_id,
      COALESCE(v_caller_email, v_req.email),
      COALESCE(v_req.full_name, split_part(COALESCE(v_caller_email, v_req.email), '@', 1)),
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

  -- 11. Atomically mark plan request as claimed
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

  -- 12. Optional in-app notification if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_notifications') THEN
    v_notif_title := format('Hambalyo! Waxaad heshay qorshaha %s.', CASE WHEN v_plan = 'premium' THEN 'Premium' ELSE 'Pro' END);
    v_notif_message := format('Qorshahaaga %s (%s) si buuxda ayaa loogu shaqaysiiyay koontadaada.', CASE WHEN v_plan = 'premium' THEN 'Premium' ELSE 'Pro' END, v_duration_somali);

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
      v_caller_id,
      v_notif_title,
      v_notif_message,
      'subscription_activated',
      jsonb_build_object(
        'reference_id', v_req.reference_id,
        'plan', v_plan,
        'billing_interval', v_interval,
        'duration', v_duration_label,
        'duration_somali', v_duration_somali,
        'activated_at', v_now,
        'expires_at', v_expires_at
      ),
      FALSE,
      v_now
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- 13. Return structured activation response
  RETURN jsonb_build_object(
    'success', TRUE,
    'reference_id', v_req.reference_id,
    'plan', v_plan,
    'plan_label', upper(v_plan),
    'billing_interval', v_interval,
    'duration', v_duration_label,
    'duration_somali', v_duration_somali,
    'subscription_id', v_sub_id,
    'activated_at', v_now,
    'expires_at', v_expires_at,
    'status', 'claimed',
    'message', format('Hambalyo! Waxaad heshay qorshaha %s.', CASE WHEN v_plan = 'premium' THEN 'Premium' ELSE 'Pro' END)
  );
END;
$$;

-- 4. Permissions: Grant EXECUTE to anon, authenticated, and service_role
-- This allows PostgREST schema cache to recognize the function for all client states.
-- Server-side security is strictly enforced inside the function via auth.uid() check.
REVOKE ALL ON FUNCTION public.claim_plan_offer(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_plan_offer(TEXT) TO anon, authenticated, service_role;

-- 5. Notify PostgREST to immediately reload schema cache
NOTIFY pgrst, 'reload schema';
