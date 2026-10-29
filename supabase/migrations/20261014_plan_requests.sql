-- ==============================================================================
-- EMufti AI - Complete Schema & Security Migration
-- Migration: 20261014_plan_requests.sql
-- 
-- 1. Safely creates and updates public.plan_requests table without breaking legacy data
-- 2. Fixes missing columns (plan_slug, message, payment_verified, admin_notes)
-- 3. Secures public.profiles with Row Level Security (RLS) & syncs auth.users
-- 4. Automatically provisions profile records via trigger on auth.users
-- 5. Hardens public.is_admin() with SECURITY DEFINER and fixed search_path
-- 6. Creates public.conversations and public.messages tables (resolving HTTP 404)
-- ==============================================================================

-- 1. Ensure required cryptographic and UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the plan_requests table if it does not already exist
CREATE TABLE IF NOT EXISTS public.plan_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  telegram TEXT,
  plan TEXT NOT NULL DEFAULT 'pro',
  plan_slug TEXT NOT NULL CHECK (plan_slug IN ('pro', 'premium')),
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

-- 3. Safely add any missing columns to existing table (preserves all existing rows)
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS reference_id TEXT;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS telegram TEXT;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'pro';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS plan_slug TEXT DEFAULT 'pro';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 4. Safely backfill legacy rows without breaking existing data
UPDATE public.plan_requests
SET reference_id = 'REQ-EMUFTI-' || upper(substr(md5(random()::text || id::text), 1, 6))
WHERE reference_id IS NULL;

UPDATE public.plan_requests
SET plan_slug = COALESCE(plan, 'pro')
WHERE plan_slug IS NULL;

UPDATE public.plan_requests
SET plan = COALESCE(plan_slug, 'pro')
WHERE plan IS NULL;

UPDATE public.plan_requests
SET status = 'pending'
WHERE status IS NULL;

UPDATE public.plan_requests
SET payment_verified = FALSE
WHERE payment_verified IS NULL;

UPDATE public.plan_requests
SET created_at = timezone('utc'::text, now())
WHERE created_at IS NULL;

UPDATE public.plan_requests
SET updated_at = timezone('utc'::text, now())
WHERE updated_at IS NULL;

-- 5. Ensure public.profiles table exists and has the role column
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  preferred_language TEXT DEFAULT 'en',
  default_response_language TEXT DEFAULT 'auto',
  theme TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_activated_at TIMESTAMPTZ;

-- 6. Secure public.is_admin() helper function
-- Hardened with SECURITY DEFINER and fixed search_path to prevent path hijacking and RLS recursion
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

-- 7. Ensure Administrator Account has confirmed email and role='admin' in public.profiles
-- Securely configures existing admin accounts without hardcoding or overwriting passwords.
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@emufti.ai' LIMIT 1;
  
  IF v_admin_id IS NOT NULL THEN
    -- Ensure email is confirmed so the administrator can authenticate
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = v_admin_id;

    -- Ensure matching profile in public.profiles with role='admin'
    INSERT INTO public.profiles (id, email, display_name, role)
    VALUES (v_admin_id, 'admin@emufti.ai', 'Chief Administrator', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', email = 'admin@emufti.ai';

    RAISE NOTICE 'Admin user (admin@emufti.ai) verified and assigned role=admin in public.profiles.';
  ELSE
    RAISE NOTICE 'Admin user (admin@emufti.ai) not found in auth.users yet. Create user via Supabase Dashboard (Authentication -> Users -> Add User) or sign up in app; the trigger will automatically assign role=admin.';
  END IF;
END $$;

-- Sync all other auth.users into public.profiles
INSERT INTO public.profiles (id, email, display_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'display_name', split_part(email, '@', 1)),
  CASE WHEN email = 'admin@emufti.ai' THEN 'admin' ELSE 'user' END
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET role = CASE WHEN public.profiles.email = 'admin@emufti.ai' THEN 'admin' ELSE public.profiles.role END;

-- 8. Auto-create profile trigger for future user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email = 'admin@emufti.ai' THEN 'admin' ELSE 'user' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. Secure Table Permissions on public.profiles
REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.profiles FROM PUBLIC;
GRANT ALL ON TABLE public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;

-- Enable Row Level Security (RLS) on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users and admins can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Policy 1: Authenticated users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Verified administrators can read all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR public.is_admin()
  );

-- Policy 3: Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Verified administrators can update profiles
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR public.is_admin()
  )
  WITH CHECK (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR public.is_admin()
  );

-- Policy 5: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 6: Verified administrators can insert/manage profiles
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR public.is_admin()
  );

-- 10. Table Permissions on public.plan_requests
GRANT ALL ON TABLE public.plan_requests TO postgres, service_role;
GRANT SELECT, INSERT ON TABLE public.plan_requests TO anon, authenticated;
GRANT UPDATE, DELETE ON TABLE public.plan_requests TO authenticated;

-- 11. Row Level Security on public.plan_requests
ALTER TABLE public.plan_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert plan requests" ON public.plan_requests;
DROP POLICY IF EXISTS "Anyone can submit a plan request" ON public.plan_requests;
DROP POLICY IF EXISTS "Admins can view all plan requests" ON public.plan_requests;
DROP POLICY IF EXISTS "Users can view own plan requests" ON public.plan_requests;
DROP POLICY IF EXISTS "Admins can update plan requests" ON public.plan_requests;
DROP POLICY IF EXISTS "Admins can delete plan requests" ON public.plan_requests;

-- Policy 1: Public submission allowed only for required fields with pending/unverified defaults
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

-- Policy 2: Verified administrators can view ALL plan requests
CREATE POLICY "Admins can view all plan requests"
  ON public.plan_requests FOR SELECT
  TO authenticated
  USING (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR public.is_admin()
  );

-- Policy 3: Authenticated users can view only their own requests
CREATE POLICY "Users can view own plan requests"
  ON public.plan_requests FOR SELECT
  TO authenticated
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.jwt() ->> 'email' = email)
  );

-- Policy 4: Verified administrators can update request status and notes
CREATE POLICY "Admins can update plan requests"
  ON public.plan_requests FOR UPDATE
  TO authenticated
  USING (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR public.is_admin()
  )
  WITH CHECK (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR public.is_admin()
  );

-- Policy 5: Verified administrators can delete requests
CREATE POLICY "Admins can delete plan requests"
  ON public.plan_requests FOR DELETE
  TO authenticated
  USING (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR public.is_admin()
  );

-- 12. Enable Supabase Realtime Replication for plan_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'plan_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.plan_requests;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Publication might already contain it or requires superuser
END $$;

-- 13. Auto-updated updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_plan_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_plan_requests_updated_at ON public.plan_requests;
CREATE TRIGGER trigger_plan_requests_updated_at
  BEFORE UPDATE ON public.plan_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_plan_requests_updated_at();

-- 14. Performance Indexes for plan_requests
CREATE INDEX IF NOT EXISTS idx_plan_requests_reference ON public.plan_requests(reference_id);
CREATE INDEX IF NOT EXISTS idx_plan_requests_user ON public.plan_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_requests_email ON public.plan_requests(email);
CREATE INDEX IF NOT EXISTS idx_plan_requests_status ON public.plan_requests(status);
CREATE INDEX IF NOT EXISTS idx_plan_requests_created ON public.plan_requests(created_at DESC);

-- 15. Ensure Conversations & Messages tables exist with RLS (Resolves HTTP 404 on conversations)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Islamic Inquiry',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  topic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  arabic_text TEXT,
  language TEXT DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('sent', 'generating', 'completed', 'failed')),
  feedback TEXT CHECK (feedback IN ('helpful', 'unhelpful')),
  citations JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.conversations TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.conversations TO authenticated;

GRANT ALL ON TABLE public.messages TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.messages TO authenticated;

DROP POLICY IF EXISTS "Users can manage own conversations" ON public.conversations;
CREATE POLICY "Users can manage own conversations"
  ON public.conversations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own messages" ON public.messages;
CREATE POLICY "Users can manage own messages"
  ON public.messages FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);

-- 16. Subscriptions Table (Optional relational subscription ledger)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'pro' CHECK (plan IN ('pro', 'premium')),
  provider TEXT NOT NULL DEFAULT 'manual' CHECK (provider IN ('stripe', 'manual', 'development')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.subscriptions TO postgres, service_role;
GRANT SELECT ON TABLE public.subscriptions TO authenticated;

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

-- 17. Atomic Plan Activation RPC Function
-- Securely and atomically updates request status and activates requested Pro/Premium plan
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
  -- 1. Security Check: verify caller is an authorized administrator
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Only verified administrators can update plan requests.';
  END IF;

  -- 2. Validate input status
  IF p_status NOT IN ('pending', 'under_review', 'approved', 'completed', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status: %', p_status;
  END IF;

  -- 3. Lock and retrieve the target plan request
  SELECT * INTO v_req FROM public.plan_requests WHERE id = p_request_id FOR UPDATE;
  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Plan request with ID % not found.', p_request_id;
  END IF;

  -- 4. Determine verified flag
  IF p_payment_verified IS NOT NULL THEN
    v_verified := p_payment_verified;
  ELSIF p_status IN ('approved', 'completed') THEN
    v_verified := TRUE;
  ELSIF p_status = 'rejected' THEN
    v_verified := FALSE;
  ELSE
    v_verified := COALESCE(v_req.payment_verified, FALSE);
  END IF;

  -- 5. Extract requested plan (never assume Pro, check plan_slug then plan)
  v_plan := lower(trim(COALESCE(v_req.plan_slug, v_req.plan, 'pro')));
  IF v_plan NOT IN ('pro', 'premium') THEN
    v_plan := 'pro';
  END IF;

  -- 6. Resolve target user ID (from request directly or lookup by email)
  v_user_id := v_req.user_id;
  IF v_user_id IS NULL AND v_req.email IS NOT NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(trim(v_req.email)) LIMIT 1;
  END IF;

  -- 7. Update plan_requests record
  UPDATE public.plan_requests
  SET
    status = p_status,
    payment_verified = v_verified,
    user_id = COALESCE(public.plan_requests.user_id, v_user_id),
    admin_notes = COALESCE(p_admin_notes, public.plan_requests.admin_notes),
    updated_at = v_now
  WHERE id = p_request_id;

  -- 8. If approved or completed AND a matching user exists, activate their exact requested plan
  IF p_status IN ('approved', 'completed') AND v_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (
      id,
      email,
      display_name,
      role,
      plan,
      plan_activated_at,
      updated_at
    )
    VALUES (
      v_user_id,
      v_req.email,
      COALESCE(v_req.full_name, split_part(v_req.email, '@', 1)),
      'user',
      v_plan,
      v_now,
      v_now
    )
    ON CONFLICT (id) DO UPDATE SET
      plan = v_plan,
      plan_activated_at = v_now,
      updated_at = v_now;

    -- Also record in subscriptions ledger
    INSERT INTO public.subscriptions (
      user_id,
      plan,
      provider,
      status,
      current_period_start,
      current_period_end
    )
    VALUES (
      v_user_id,
      v_plan,
      'manual',
      'active',
      v_now,
      v_now + INTERVAL '30 days'
    );
  END IF;

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
GRANT EXECUTE ON FUNCTION public.update_plan_request_status(UUID, TEXT, TEXT, BOOLEAN) TO authenticated;

-- 18. Automatic Plan Activation Trigger on public.plan_requests
-- Ensures that ANY approval or completion (via API, dashboard, or SQL) activates the user's plan
CREATE OR REPLACE FUNCTION public.handle_plan_request_activation()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_plan TEXT;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  -- Fire only on transition to approved or completed
  IF (NEW.status IN ('approved', 'completed')) AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.status NOT IN ('approved', 'completed')) THEN
    NEW.payment_verified := TRUE;

    -- Extract exact requested plan (Pro -> pro, Premium -> premium)
    v_plan := lower(trim(COALESCE(NEW.plan_slug, NEW.plan, 'pro')));
    IF v_plan NOT IN ('pro', 'premium') THEN
      v_plan := 'pro';
    END IF;

    -- Resolve user ID
    v_user_id := NEW.user_id;
    IF v_user_id IS NULL AND NEW.email IS NOT NULL THEN
      SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(trim(NEW.email)) LIMIT 1;
      IF v_user_id IS NOT NULL THEN
        NEW.user_id := v_user_id;
      END IF;
    END IF;

    -- If user account exists, activate the plan in profiles
    IF v_user_id IS NOT NULL THEN
      UPDATE public.profiles
      SET
        plan = v_plan,
        plan_activated_at = v_now,
        updated_at = v_now
      WHERE id = v_user_id;

      IF NOT FOUND THEN
        INSERT INTO public.profiles (id, email, display_name, role, plan, plan_activated_at, updated_at)
        VALUES (
          v_user_id,
          NEW.email,
          COALESCE(NEW.full_name, split_part(NEW.email, '@', 1)),
          'user',
          v_plan,
          v_now,
          v_now
        )
        ON CONFLICT (id) DO UPDATE SET
          plan = v_plan,
          plan_activated_at = v_now,
          updated_at = v_now;
      END IF;

      -- Insert record in subscriptions
      INSERT INTO public.subscriptions (user_id, plan, provider, status, current_period_start, current_period_end)
      VALUES (v_user_id, v_plan, 'manual', 'active', v_now, v_now + INTERVAL '30 days');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_plan_request_activation ON public.plan_requests;
CREATE TRIGGER trigger_plan_request_activation
  BEFORE UPDATE ON public.plan_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_plan_request_activation();

-- 19. Secure Reference ID Tracking RPC Function
CREATE OR REPLACE FUNCTION public.get_plan_request_status(p_reference_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req RECORD;
  v_clean_ref TEXT;
BEGIN
  v_clean_ref := upper(trim(COALESCE(p_reference_id, '')));
  IF v_clean_ref = '' THEN
    RETURN NULL;
  END IF;

  SELECT 
    id,
    reference_id,
    plan,
    plan_slug,
    status,
    payment_verified,
    created_at
  INTO v_req
  FROM public.plan_requests
  WHERE upper(trim(reference_id)) = v_clean_ref
  LIMIT 1;

  IF v_req IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', v_req.id,
    'reference_id', v_req.reference_id,
    'plan', COALESCE(v_req.plan_slug, v_req.plan, 'pro'),
    'plan_slug', COALESCE(v_req.plan_slug, v_req.plan, 'pro'),
    'status', v_req.status,
    'payment_verified', COALESCE(v_req.payment_verified, FALSE),
    'created_at', v_req.created_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_plan_request_status(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_plan_request_status(TEXT) TO anon, authenticated, service_role;

-- 20. Secure Public Tracking View
CREATE OR REPLACE VIEW public.plan_request_tracking AS
SELECT 
  id,
  reference_id,
  plan,
  plan_slug,
  status,
  payment_verified,
  created_at
FROM public.plan_requests;

GRANT SELECT ON public.plan_request_tracking TO anon, authenticated;

