-- ==============================================================================
-- EMufti AI - Comprehensive Plan Activation Hardening & Entitlement Sync
-- Migration: 20261015_plan_activation_hardening.sql
-- Target Supabase Project: ozvvxuzecwhlpbfongiy
--
-- Features:
-- 1. Schema Pre-requisites:
--    - Adds 'plan' and 'plan_activated_at' to public.profiles
--    - Ensures public.plan_requests has all necessary columns
--    - Creates public.subscriptions relational ledger with RLS
-- 2. Security & Admin Authorization:
--    - Enforces public.is_admin() with SECURITY DEFINER
-- 3. Payment Verification & Safe Plan Activation:
--    - Prevents activating unpaid or unverified requests
--    - Enforces real registered user account association
--    - Atomic plan activation in profiles and subscriptions (canceling previous active records)
-- 4. User Entitlement Sync & Auto-Linking:
--    - Auto-links unlinked requests when user registers (handle_new_user)
--    - Syncs user entitlements on demand (sync_user_plan_entitlements)
-- 5. Truthful Tracking Status:
--    - get_plan_request_status returns granular activation_state
--    - Distinguishes active, awaiting_registration, payment_pending, under_review, rejected
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Verify and prepare public.profiles columns
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

-- Ensure constraint on profiles.plan
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_plan'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT chk_profiles_plan CHECK (plan IN ('free', 'pro', 'premium'));
  END IF;
END $$;

-- 3. Verify and prepare public.plan_requests columns
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chk_contact_provided CHECK (
    (whatsapp IS NOT NULL AND trim(whatsapp) != '') OR 
    (telegram IS NOT NULL AND trim(telegram) != '')
  )
);

ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'pro';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS plan_slug TEXT DEFAULT 'pro';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Synchronize plan and plan_slug for consistency
UPDATE public.plan_requests SET plan_slug = COALESCE(plan, 'pro') WHERE plan_slug IS NULL;
UPDATE public.plan_requests SET plan = COALESCE(plan_slug, 'pro') WHERE plan IS NULL;

-- 4. Verify and create public.subscriptions ledger table
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

-- 5. Hardened is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  -- 1. Check if authenticated user's verified JWT email is admin@emufti.ai
  IF coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai' THEN
    RETURN TRUE;
  END IF;

  -- 2. Check if JWT app_metadata or user_metadata specifies admin role
  IF coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' OR
     coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- 3. Check if matching profile in public.profiles has role = 'admin'
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 6. Row Level Security Policies
ALTER TABLE public.plan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Plan Requests Policies
DROP POLICY IF EXISTS "Anyone can insert plan requests" ON public.plan_requests;
CREATE POLICY "Anyone can insert plan requests"
  ON public.plan_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending' AND
    payment_verified = FALSE AND
    (plan_slug IN ('pro', 'premium') OR plan IN ('pro', 'premium')) AND
    reference_id IS NOT NULL AND
    full_name IS NOT NULL AND
    email IS NOT NULL AND
    (
      (whatsapp IS NOT NULL AND trim(whatsapp) != '') OR
      (telegram IS NOT NULL AND trim(telegram) != '')
    )
  );

DROP POLICY IF EXISTS "Admins can view all plan requests" ON public.plan_requests;
CREATE POLICY "Admins can view all plan requests"
  ON public.plan_requests FOR SELECT
  TO authenticated
  USING (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Users can view own plan requests" ON public.plan_requests;
CREATE POLICY "Users can view own plan requests"
  ON public.plan_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (email IS NOT NULL AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  );

DROP POLICY IF EXISTS "Admins can update plan requests" ON public.plan_requests;
CREATE POLICY "Admins can update plan requests"
  ON public.plan_requests FOR UPDATE
  TO authenticated
  USING (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR public.is_admin()
  );

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR public.is_admin()
  );

-- Subscriptions Policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage all subscriptions"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR public.is_admin()
  );

GRANT ALL ON TABLE public.plan_requests TO postgres, service_role;
GRANT SELECT, INSERT ON TABLE public.plan_requests TO anon, authenticated;
GRANT UPDATE, DELETE ON TABLE public.plan_requests TO authenticated;

GRANT ALL ON TABLE public.profiles TO postgres, service_role;
GRANT SELECT, UPDATE, INSERT ON TABLE public.profiles TO authenticated;

GRANT ALL ON TABLE public.subscriptions TO postgres, service_role;
GRANT SELECT ON TABLE public.subscriptions TO authenticated;

-- 7. Disable / Remove duplicate activation triggers on public.plan_requests
DROP TRIGGER IF EXISTS trigger_plan_request_activation ON public.plan_requests;
DROP FUNCTION IF EXISTS public.handle_plan_request_activation();

-- 8. Atomic Plan Activation RPC Function (Single Source of Truth)
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

  -- 5. Extract exact requested plan (Map Pro -> pro, Premium -> premium; never assume Pro)
  v_plan := lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'pro')));
  IF v_plan NOT IN ('pro', 'premium') THEN
    v_plan := 'pro';
  END IF;

  -- 6. Enforce payment verification before allowing approval/completion
  IF p_status IN ('approved', 'completed') AND v_verified IS NOT TRUE THEN
    RAISE EXCEPTION 'Cannot activate % plan for request %: Payment verification is required before approval and activation.',
      upper(v_plan), v_req.reference_id;
  END IF;

  -- 7. Resolve target user ID (from request directly, or by looking up applicant email in auth.users)
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
  -- Never report activation as successful when there is no real user account
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

  -- 10. If status is approved or completed, activate plan in profiles and record subscription
  IF p_status IN ('approved', 'completed') AND v_user_id IS NOT NULL THEN
    -- A. Update user profile to the exact requested plan
    UPDATE public.profiles
    SET
      plan = v_plan,
      plan_activated_at = v_now,
      updated_at = v_now
    WHERE id = v_user_id;

    IF NOT FOUND THEN
      INSERT INTO public.profiles (
        id,
        email,
        display_name,
        role,
        plan,
        plan_activated_at,
        created_at,
        updated_at
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

    -- B. Record in subscriptions table exactly once in this transaction
    -- Cancel any previously active subscriptions for this user to avoid duplicates
    UPDATE public.subscriptions
    SET status = 'canceled', updated_at = v_now
    WHERE user_id = v_user_id AND status = 'active';

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

  -- 11. Return detailed success JSON payload
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

-- 9. Auto-sync and Auto-linking on User Registration
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

-- 10. User Entitlement Synchronization RPC Function (Syncs current user on login/reload)
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
  ORDER BY created_at DESC
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

-- 11. Secure Reference ID Tracking RPC Function (With Granular Truthful States)
CREATE OR REPLACE FUNCTION public.get_plan_request_status(p_reference_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req RECORD;
  v_clean_ref TEXT;
  v_has_user BOOLEAN := FALSE;
  v_is_active BOOLEAN := FALSE;
  v_activation_state TEXT;
  v_plan TEXT;
BEGIN
  v_clean_ref := upper(trim(COALESCE(p_reference_id, '')));
  IF v_clean_ref = '' THEN
    RETURN NULL;
  END IF;

  SELECT 
    id,
    reference_id,
    user_id,
    email,
    plan,
    plan_slug,
    status,
    payment_verified,
    created_at,
    updated_at
  INTO v_req
  FROM public.plan_requests
  WHERE upper(trim(reference_id)) = v_clean_ref
  LIMIT 1;

  IF v_req IS NULL THEN
    RETURN NULL;
  END IF;

  v_plan := lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'pro')));
  IF v_plan NOT IN ('pro', 'premium') THEN
    v_plan := 'pro';
  END IF;

  -- Check if user account exists
  IF v_req.user_id IS NOT NULL THEN
    v_has_user := EXISTS (SELECT 1 FROM auth.users WHERE id = v_req.user_id);
  ELSIF v_req.email IS NOT NULL AND trim(v_req.email) <> '' THEN
    v_has_user := EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower(trim(v_req.email)));
  END IF;

  -- Check if plan is active in subscriptions/profiles
  IF v_has_user AND v_req.status IN ('approved', 'completed') THEN
    v_is_active := EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE (user_id = v_req.user_id OR user_id IN (SELECT id FROM auth.users WHERE lower(email) = lower(trim(v_req.email))))
        AND status = 'active'
        AND plan = v_plan
    );
  END IF;

  -- Determine granular, truthful activation state
  IF v_req.status = 'rejected' THEN
    v_activation_state := 'rejected';
  ELSIF v_req.status IN ('approved', 'completed') THEN
    IF NOT COALESCE(v_req.payment_verified, FALSE) THEN
      v_activation_state := 'payment_pending';
    ELSIF NOT v_has_user THEN
      v_activation_state := 'awaiting_registration';
    ELSIF v_is_active THEN
      v_activation_state := 'active';
    ELSE
      v_activation_state := 'approved';
    END IF;
  ELSIF v_req.status = 'under_review' THEN
    v_activation_state := 'under_review';
  ELSE
    IF NOT COALESCE(v_req.payment_verified, FALSE) THEN
      v_activation_state := 'payment_pending';
    ELSE
      v_activation_state := 'pending';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'id', v_req.id,
    'reference_id', v_req.reference_id,
    'plan', v_plan,
    'plan_slug', v_plan,
    'status', v_req.status,
    'payment_verified', COALESCE(v_req.payment_verified, FALSE),
    'has_registered_account', v_has_user,
    'is_active', v_is_active,
    'activation_state', v_activation_state,
    'created_at', v_req.created_at,
    'updated_at', v_req.updated_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_plan_request_status(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_plan_request_status(TEXT) TO anon, authenticated, service_role;

-- 12. Secure Public Tracking View (Excludes private applicant contact details and coordinator notes)
CREATE OR REPLACE VIEW public.plan_request_tracking AS
SELECT 
  id,
  reference_id,
  plan,
  plan_slug,
  status,
  payment_verified,
  created_at,
  updated_at
FROM public.plan_requests;

GRANT SELECT ON public.plan_request_tracking TO anon, authenticated;

-- 13. PostgREST Schema Cache Reload Notification
NOTIFY pgrst, 'reload schema';
