-- ==============================================================================
-- EMufti AI - Help Center Support Requests & Admin Reply System
-- Migration: 20261016_support_requests.sql
--
-- Features:
-- 1. Self-contained public.is_admin() helper to guarantee RLS evaluation
-- 2. Table public.support_requests with comprehensive fields:
--    - id, reference_id, user_id (nullable for guests), guest_access_token
--    - full_name, email, phone, subject, description
--    - status: 'submitted', 'in_review', 'replied', 'closed'
--    - admin_reply, admin_id, admin_notes, replied_at, created_at, updated_at
-- 3. Performance & Lookup Indexes (reference_id, user_id, status, created_at)
-- 4. Row Level Security (RLS) Policies:
--    - Users can view their own requests (auth.uid() = user_id OR is_admin())
--    - Anyone (anon and authenticated) can submit a request (user_id IS NULL OR user_id = auth.uid())
--    - Only authorized administrators can update/delete requests
-- 5. Secure RPC public.get_guest_support_request for verified guest lookup
-- 6. Secure RPC public.reply_to_support_request for admin reply submission
-- 7. Automatic updated_at trigger
-- 8. PostgREST schema cache reload notification (NOTIFY pgrst, 'reload schema')
-- ==============================================================================

-- 1. Ensure public.is_admin() helper is defined and available
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Check verified JWT email
  IF coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai' THEN
    RETURN TRUE;
  END IF;

  -- Check admin role in profiles table
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 2. Create table public.support_requests
CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_access_token TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT DEFAULT 'General Support',
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'replied', 'closed')),
  admin_reply TEXT,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_support_requests_ref ON public.support_requests (reference_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_user ON public.support_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON public.support_requests (status);
CREATE INDEX IF NOT EXISTS idx_support_requests_created ON public.support_requests (created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Anyone can submit support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Admins can update support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Admins can delete support requests" ON public.support_requests;

-- 5. RLS Policies

-- Select policy: Authenticated users can view their own requests, Admins can view all
CREATE POLICY "Users can view own support requests"
ON public.support_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Insert policy: Anyone (anon or authenticated) can submit a support request
CREATE POLICY "Anyone can submit support requests"
ON public.support_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Update policy: Only authorized administrators can update support requests and replies
CREATE POLICY "Admins can update support requests"
ON public.support_requests
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Delete policy: Only authorized administrators can delete support requests
CREATE POLICY "Admins can delete support requests"
ON public.support_requests
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Explicit table permissions
GRANT ALL ON TABLE public.support_requests TO postgres, service_role;
GRANT SELECT, INSERT ON TABLE public.support_requests TO anon, authenticated;
GRANT UPDATE, DELETE ON TABLE public.support_requests TO authenticated;

-- 6. Secure RPC: get_guest_support_request
CREATE OR REPLACE FUNCTION public.get_guest_support_request(p_reference_id TEXT, p_access_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req RECORD;
BEGIN
  IF p_reference_id IS NULL OR p_access_token IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_req
  FROM public.support_requests
  WHERE upper(trim(reference_id)) = upper(trim(p_reference_id))
    AND guest_access_token = trim(p_access_token)
  LIMIT 1;

  IF v_req IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN to_jsonb(v_req);
END;
$$;

REVOKE ALL ON FUNCTION public.get_guest_support_request(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_guest_support_request(TEXT, TEXT) TO anon, authenticated, service_role;

-- 7. Secure RPC: reply_to_support_request
CREATE OR REPLACE FUNCTION public.reply_to_support_request(
  p_request_id UUID,
  p_reply TEXT,
  p_status TEXT DEFAULT 'replied',
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin_id UUID;
  v_status TEXT := COALESCE(p_status, 'replied');
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_req RECORD;
BEGIN
  -- Strict verification of administrator role
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.';
  END IF;

  v_admin_id := auth.uid();

  IF v_status NOT IN ('submitted', 'in_review', 'replied', 'closed') THEN
    v_status := 'replied';
  END IF;

  UPDATE public.support_requests
  SET
    admin_reply = p_reply,
    admin_id = v_admin_id,
    admin_notes = COALESCE(p_admin_notes, admin_notes),
    status = v_status,
    replied_at = CASE WHEN p_reply IS NOT NULL AND trim(p_reply) <> '' THEN v_now ELSE replied_at END,
    updated_at = v_now
  WHERE id = p_request_id
  RETURNING * INTO v_req;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Support request not found.';
  END IF;

  RETURN to_jsonb(v_req);
END;
$$;

REVOKE ALL ON FUNCTION public.reply_to_support_request(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reply_to_support_request(UUID, TEXT, TEXT, TEXT) TO authenticated, service_role;

-- 8. Trigger for automatic updated_at
CREATE OR REPLACE FUNCTION public.handle_support_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_support_requests_updated_at ON public.support_requests;
CREATE TRIGGER trigger_support_requests_updated_at
  BEFORE UPDATE ON public.support_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_support_requests_updated_at();

-- 9. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
