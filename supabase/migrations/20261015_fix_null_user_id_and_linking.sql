-- ==============================================================================
-- EMufti AI - Fix NULL user_id in Plan Requests and Automatic Subscription Activation
-- Migration: 20261015_fix_null_user_id_and_linking.sql
-- Target Supabase Project: ozvvxuzecwhlpbfongiy
--
-- 1. Automatic Trusted user_id Injection on Insert:
--    - BEFORE INSERT trigger enforces NEW.user_id := auth.uid() for authenticated callers.
--    - Prevents arbitrary user UUIDs supplied by frontend.
--    - Keeps unauthenticated requests unlinked (NULL) until verified account linking.
--
-- 2. Safe Administrative Repair Function:
--    - public.repair_unlinked_plan_requests() links NULL requests to registered accounts by verified email.
--    - Strictly admin-only (is_admin()).
--    - Does NOT automatically activate subscriptions during repair step.
--
-- 3. Atomic Single-Request Account Linking:
--    - public.link_plan_request_to_user(UUID, UUID) allows admins to link requests.
--
-- 4. Atomic Plan Activation (update_plan_request_status):
--    - Enforces is_admin().
--    - Requires valid associated user account (never activates NULL user requests).
--    - Enforces payment verification before granting paid access.
--    - Atomically updates profiles.plan and records subscription in public.subscriptions.
--    - Prevents duplicate active subscriptions.
--
-- 5. Auto-linking on User Signup & Login:
--    - Trigger on auth.users (handle_new_user) links existing NULL requests upon user registration.
--    - Entitlement sync (sync_user_plan_entitlements) reconciles user subscriptions on login/reload.
-- ==============================================================================

-- 1. Ensure required cryptographic and UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Ensure schema columns on public.plan_requests, profiles, subscriptions
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  preferred_language TEXT DEFAULT 'en',
  default_response_language TEXT DEFAULT 'auto',
  theme TEXT DEFAULT 'system',
  plan TEXT NOT NULL DEFAULT 'free',
  plan_activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_activated_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE TABLE IF NOT EXISTS public.plan_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  telegram TEXT,
  plan TEXT NOT NULL DEFAULT 'pro',
  plan_slug TEXT NOT NULL DEFAULT 'pro' CHECK (plan_slug IN ('pro', 'premium')),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_verified BOOLEAN NOT NULL DEFAULT FALSE,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'pro';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS plan_slug TEXT DEFAULT 'pro';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'premium')),
  provider TEXT NOT NULL DEFAULT 'manual' CHECK (provider IN ('stripe', 'manual', 'development')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete')),
  request_id UUID REFERENCES public.plan_requests(id) ON DELETE SET NULL,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES public.plan_requests(id) ON DELETE SET NULL;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 3. Hardened is_admin() function
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

  IF coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' OR
     coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin' THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 4. Trigger to enforce trusted user_id on plan_requests insert
-- Never accept an arbitrary user UUID from frontend input.
CREATE OR REPLACE FUNCTION public.handle_plan_request_insert_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If caller is authenticated in Supabase Auth, always bind to trusted auth.uid()
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
    -- If email was not provided or empty, pull trusted email from JWT
    IF NEW.email IS NULL OR trim(NEW.email) = '' THEN
      NEW.email := coalesce(auth.jwt() ->> 'email', NEW.email);
    END IF;
  ELSE
    -- Unauthenticated caller: ensure user_id is explicitly NULL (unlinked)
    NEW.user_id := NULL;
  END IF;

  -- Ensure updated_at timestamp is current
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trigger_set_plan_request_user_id ON public.plan_requests;
CREATE TRIGGER trigger_set_plan_request_user_id
  BEFORE INSERT ON public.plan_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_plan_request_insert_user_id();

-- 5. Administrative function to safely repair existing NULL user_id requests
CREATE OR REPLACE FUNCTION public.repair_unlinked_plan_requests()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req RECORD;
  v_user_id UUID;
  v_user_count INT;
  v_linked_count INT := 0;
  v_unlinked_count INT := 0;
  v_details JSONB := '[]'::jsonb;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  -- 1. Security Check: Only verified administrators can execute repair
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Only verified administrators can repair unlinked plan requests.';
  END IF;

  -- 2. Iterate through all plan requests with NULL user_id
  FOR v_req IN
    SELECT id, reference_id, email, full_name, plan, plan_slug, status, payment_verified
    FROM public.plan_requests
    WHERE user_id IS NULL AND email IS NOT NULL AND trim(email) <> ''
    ORDER BY created_at ASC
  LOOP
    -- Look for unambiguous registered account in auth.users
    SELECT count(*), min(id) INTO v_user_count, v_user_id
    FROM auth.users
    WHERE lower(email) = lower(trim(v_req.email));

    -- Link only if exactly one unambiguous user account matches
    IF v_user_count = 1 AND v_user_id IS NOT NULL THEN
      UPDATE public.plan_requests
      SET user_id = v_user_id, updated_at = v_now
      WHERE id = v_req.id;

      v_linked_count := v_linked_count + 1;
      v_details := v_details || jsonb_build_object(
        'request_id', v_req.id,
        'reference_id', v_req.reference_id,
        'email', v_req.email,
        'linked_user_id', v_user_id,
        'status', 'linked'
      );
    ELSE
      -- Keep request unlinked without guessing
      v_unlinked_count := v_unlinked_count + 1;
      v_details := v_details || jsonb_build_object(
        'request_id', v_req.id,
        'reference_id', v_req.reference_id,
        'email', v_req.email,
        'status', CASE WHEN v_user_count > 1 THEN 'ambiguous_multiple_accounts' ELSE 'no_registered_account' END
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', TRUE,
    'linked_count', v_linked_count,
    'unlinked_count', v_unlinked_count,
    'repaired_at', v_now,
    'details', v_details
  );
END;
$$;

REVOKE ALL ON FUNCTION public.repair_unlinked_plan_requests() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.repair_unlinked_plan_requests() TO authenticated, service_role;

-- 6. Administrative function to link a specific request to an account
CREATE OR REPLACE FUNCTION public.link_plan_request_to_user(
  p_request_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req RECORD;
  v_target_user_id UUID := p_user_id;
  v_user_email TEXT;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Only verified administrators can link plan requests.';
  END IF;

  SELECT * INTO v_req FROM public.plan_requests WHERE id = p_request_id;
  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Plan request with ID "%" was not found.', p_request_id;
  END IF;

  -- If user_id not explicitly supplied, look up by applicant email
  IF v_target_user_id IS NULL THEN
    SELECT id, email INTO v_target_user_id, v_user_email
    FROM auth.users
    WHERE lower(email) = lower(trim(v_req.email))
    LIMIT 1;

    IF v_target_user_id IS NULL THEN
      RAISE EXCEPTION 'No registered user account found matching email "%". Applicant must register first.', v_req.email;
    END IF;
  ELSE
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_target_user_id;
    IF v_user_email IS NULL THEN
      RAISE EXCEPTION 'Specified user ID "%" does not exist in auth.users.', v_target_user_id;
    END IF;
  END IF;

  UPDATE public.plan_requests
  SET user_id = v_target_user_id, updated_at = v_now
  WHERE id = p_request_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'request_id', p_request_id,
    'reference_id', v_req.reference_id,
    'linked_user_id', v_target_user_id,
    'user_email', v_user_email
  );
END;
$$;

REVOKE ALL ON FUNCTION public.link_plan_request_to_user(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_plan_request_to_user(UUID, UUID) TO authenticated, service_role;

-- 7. Atomic Plan Activation RPC (Requires valid associated user account)
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
  v_verified BOOLEAN;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  -- 1. Security Check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Only verified administrators can update plan requests.';
  END IF;

  -- 2. Validate status
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

  -- 5. Extract exact requested plan
  v_plan := lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'pro')));
  IF v_plan NOT IN ('pro', 'premium') THEN
    v_plan := 'pro';
  END IF;

  -- 6. Enforce payment verification before approval/completion
  IF p_status IN ('approved', 'completed') AND v_verified IS NOT TRUE THEN
    RAISE EXCEPTION 'Cannot activate % plan for request %: Payment verification is required before approval and activation.',
      upper(v_plan), v_req.reference_id;
  END IF;

  -- 7. Resolve target user ID (from request directly, or by looking up applicant email in auth.users)
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

  -- 8. Enforce that an approved request MUST have a registered user account
  -- Never activate subscription for unlinked NULL requests
  IF p_status IN ('approved', 'completed') AND v_user_id IS NULL THEN
    RAISE EXCEPTION 'Cannot activate % plan: Request % has no associated registered user account (email: "%"). The applicant must register an account first before approval can activate their subscription.',
      upper(v_plan), v_req.reference_id, COALESCE(v_req.email, 'unknown');
  END IF;

  -- 9. Update public.plan_requests atomically in transaction
  UPDATE public.plan_requests
  SET
    status = p_status,
    payment_verified = v_verified,
    user_id = COALESCE(public.plan_requests.user_id, v_user_id),
    plan = v_plan,
    plan_slug = v_plan,
    admin_notes = COALESCE(p_admin_notes, public.plan_requests.admin_notes),
    updated_at = v_now
  WHERE id = p_request_id;

  -- 10. Activate plan atomically in profiles and subscriptions
  IF p_status IN ('approved', 'completed') AND v_user_id IS NOT NULL THEN
    -- Update profile
    UPDATE public.profiles
    SET
      plan = v_plan,
      plan_activated_at = v_now,
      updated_at = v_now
    WHERE id = v_user_id;

    IF NOT FOUND THEN
      INSERT INTO public.profiles (
        id, email, display_name, role, plan, plan_activated_at, created_at, updated_at
      )
      VALUES (
        v_user_id,
        v_req.email,
        COALESCE(v_req.full_name, split_part(v_req.email, '@', 1)),
        'user',
        v_plan,
        v_now,
        v_now,
        v_now
      )
      ON CONFLICT (id) DO UPDATE SET
        plan = v_plan,
        plan_activated_at = v_now,
        updated_at = v_now;
    END IF;

    -- Cancel prior active subscriptions to prevent duplicates
    UPDATE public.subscriptions
    SET status = 'canceled', updated_at = v_now
    WHERE user_id = v_user_id AND status = 'active';

    -- Insert active subscription
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
      v_user_id,
      v_plan,
      'manual',
      'active',
      p_request_id,
      v_now,
      v_now + INTERVAL '30 days',
      v_now,
      v_now
    );
  END IF;

  -- 11. Return result
  RETURN jsonb_build_object(
    'success', TRUE,
    'request_id', p_request_id,
    'reference_id', v_req.reference_id,
    'status', p_status,
    'payment_verified', v_verified,
    'user_id', v_user_id,
    'plan', CASE WHEN p_status IN ('approved', 'completed') THEN v_plan ELSE NULL END,
    'plan_activated', (p_status IN ('approved', 'completed') AND v_user_id IS NOT NULL),
    'updated_at', v_now
  );
END;
$$;

REVOKE ALL ON FUNCTION public.update_plan_request_status(UUID, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_plan_request_status(UUID, TEXT, TEXT, BOOLEAN) TO authenticated, service_role;

-- 8. Auto-link on User Registration Trigger (handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_req RECORD;
  v_plan TEXT;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  -- 1. Create default user profile
  INSERT INTO public.profiles (id, email, display_name, role, plan, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email = 'admin@emufti.ai' THEN 'admin' ELSE 'user' END,
    'free',
    v_now,
    v_now
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = v_now;

  -- 2. Link any unlinked plan requests matching this email
  IF NEW.email IS NOT NULL AND trim(NEW.email) <> '' THEN
    UPDATE public.plan_requests
    SET user_id = NEW.id, updated_at = v_now
    WHERE lower(email) = lower(trim(NEW.email)) AND user_id IS NULL;

    -- 3. Check if an approved and payment-verified request already exists for this email
    SELECT * INTO v_req
    FROM public.plan_requests
    WHERE user_id = NEW.id
      AND status IN ('approved', 'completed')
      AND payment_verified = TRUE
    ORDER BY updated_at DESC
    LIMIT 1;

    IF v_req IS NOT NULL THEN
      v_plan := lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'pro')));
      IF v_plan IN ('pro', 'premium') THEN
        UPDATE public.profiles
        SET plan = v_plan, plan_activated_at = v_now, updated_at = v_now
        WHERE id = NEW.id;

        INSERT INTO public.subscriptions (
          user_id, plan, provider, status, request_id, current_period_start, current_period_end, created_at, updated_at
        ) VALUES (
          NEW.id, v_plan, 'manual', 'active', v_req.id, v_now, v_now + INTERVAL '30 days', v_now, v_now
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. Entitlement Sync on Login/Reload
CREATE OR REPLACE FUNCTION public.sync_user_plan_entitlements()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_email TEXT := coalesce(auth.jwt() ->> 'email', '');
  v_sub RECORD;
  v_req RECORD;
  v_plan TEXT := 'free';
  v_act_at TIMESTAMPTZ := NULL;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Not authenticated');
  END IF;

  -- 1. Link any unlinked requests matching user email
  IF v_email <> '' THEN
    UPDATE public.plan_requests
    SET user_id = v_uid, updated_at = v_now
    WHERE lower(email) = lower(trim(v_email)) AND user_id IS NULL;
  END IF;

  -- 2. Check for active subscription
  SELECT * INTO v_sub
  FROM public.subscriptions
  WHERE user_id = v_uid AND status = 'active'
  ORDER BY current_period_end DESC, created_at DESC
  LIMIT 1;

  IF v_sub IS NOT NULL THEN
    v_plan := v_sub.plan;
    v_act_at := v_sub.current_period_start;
  ELSE
    -- 3. Check for approved and payment-verified plan request
    SELECT * INTO v_req
    FROM public.plan_requests
    WHERE (user_id = v_uid OR (v_email <> '' AND lower(email) = lower(trim(v_email))))
      AND status IN ('approved', 'completed')
      AND payment_verified = TRUE
    ORDER BY updated_at DESC
    LIMIT 1;

    IF v_req IS NOT NULL THEN
      v_plan := lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'pro')));
      IF v_plan IN ('pro', 'premium') THEN
        v_act_at := v_now;

        -- Create active subscription
        INSERT INTO public.subscriptions (
          user_id, plan, provider, status, request_id, current_period_start, current_period_end, created_at, updated_at
        ) VALUES (
          v_uid, v_plan, 'manual', 'active', v_req.id, v_now, v_now + INTERVAL '30 days', v_now, v_now
        );
      END IF;
    END IF;
  END IF;

  -- 4. Update profile plan to match verified state
  UPDATE public.profiles
  SET plan = v_plan, plan_activated_at = COALESCE(plan_activated_at, v_act_at), updated_at = v_now
  WHERE id = v_uid;

  RETURN jsonb_build_object(
    'success', TRUE,
    'user_id', v_uid,
    'plan', v_plan,
    'plan_activated_at', v_act_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.sync_user_plan_entitlements() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_user_plan_entitlements() TO authenticated, service_role;

-- 10. PostgREST Schema Cache Reload Notification
NOTIFY pgrst, 'reload schema';
