-- ==============================================================================
-- Migration: 20261017_login_security_and_lockout.sql
-- EMUFTI AI - Server-Enforced Login Rate Limiting & 3-Attempt Account Lockout
-- ==============================================================================

-- 1. Ensure pgcrypto extension is available for sha256 hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create login attempts table (stores email hash to prevent plaintext credential leaks)
CREATE TABLE IF NOT EXISTS public.account_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier_hash TEXT NOT NULL UNIQUE,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ NULL,
  last_failed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on identifier_hash for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_login_attempts_hash ON public.account_login_attempts(identifier_hash);

-- Enable RLS: Direct access is restricted; operations occur through SECURITY DEFINER RPCs
ALTER TABLE public.account_login_attempts ENABLE ROW LEVEL SECURITY;

-- Helper to safely compute a lowercase trimmed SHA-256 hash of the identifier
CREATE OR REPLACE FUNCTION public.hash_login_identifier(p_email TEXT)
RETURNS TEXT AS $$
BEGIN
  BEGIN
    RETURN encode(digest(lower(trim(p_email)), 'sha256'), 'hex');
  EXCEPTION WHEN OTHERS THEN
    RETURN md5(lower(trim(p_email)));
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Check account lockout status before authentication
CREATE OR REPLACE FUNCTION public.check_account_login_status(p_email TEXT)
RETURNS JSONB AS $$
DECLARE
  v_hash TEXT;
  v_rec RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_remaining_seconds INT := 0;
BEGIN
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RETURN jsonb_build_object('is_locked', false, 'failed_attempts', 0);
  END IF;

  v_hash := public.hash_login_identifier(p_email);
  SELECT * INTO v_rec FROM public.account_login_attempts WHERE identifier_hash = v_hash;

  IF FOUND THEN
    -- If locked and lockout period has not expired
    IF v_rec.locked_until IS NOT NULL AND v_rec.locked_until > v_now THEN
      v_remaining_seconds := EXTRACT(EPOCH FROM (v_rec.locked_until - v_now))::INT;
      RETURN jsonb_build_object(
        'is_locked', true,
        'failed_attempts', v_rec.failed_attempts,
        'locked_until', v_rec.locked_until,
        'remaining_seconds', v_remaining_seconds
      );
    END IF;

    -- If lockout expired, reset failed attempts
    IF v_rec.locked_until IS NOT NULL AND v_rec.locked_until <= v_now THEN
      UPDATE public.account_login_attempts
      SET failed_attempts = 0, locked_until = NULL, updated_at = v_now
      WHERE identifier_hash = v_hash;
    END IF;

    RETURN jsonb_build_object(
      'is_locked', false,
      'failed_attempts', v_rec.failed_attempts
    );
  END IF;

  RETURN jsonb_build_object('is_locked', false, 'failed_attempts', 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Record a failed login attempt; locks account for 15 minutes upon reaching 3 consecutive failures
CREATE OR REPLACE FUNCTION public.record_failed_login_attempt(p_email TEXT)
RETURNS JSONB AS $$
DECLARE
  v_hash TEXT;
  v_rec RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_lockout_duration INTERVAL := INTERVAL '15 minutes';
  v_new_attempts INT;
  v_locked_until TIMESTAMPTZ := NULL;
  v_is_locked BOOLEAN := false;
  v_remaining_seconds INT := 0;
BEGIN
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RETURN jsonb_build_object('is_locked', false, 'failed_attempts', 0);
  END IF;

  v_hash := public.hash_login_identifier(p_email);
  SELECT * INTO v_rec FROM public.account_login_attempts WHERE identifier_hash = v_hash FOR UPDATE;

  IF FOUND THEN
    -- If previously locked but window passed, start fresh
    IF v_rec.locked_until IS NOT NULL AND v_rec.locked_until <= v_now THEN
      v_new_attempts := 1;
      v_locked_until := NULL;
      v_is_locked := false;
    ELSE
      v_new_attempts := v_rec.failed_attempts + 1;
      IF v_new_attempts >= 3 THEN
        v_locked_until := v_now + v_lockout_duration;
        v_is_locked := true;
        v_remaining_seconds := 900; -- 15 minutes
      END IF;
    END IF;

    UPDATE public.account_login_attempts
    SET failed_attempts = v_new_attempts,
        locked_until = v_locked_until,
        last_failed_at = v_now,
        updated_at = v_now
    WHERE identifier_hash = v_hash;
  ELSE
    v_new_attempts := 1;
    INSERT INTO public.account_login_attempts (identifier_hash, failed_attempts, last_failed_at, updated_at)
    VALUES (v_hash, 1, v_now, v_now);
  END IF;

  RETURN jsonb_build_object(
    'is_locked', v_is_locked,
    'failed_attempts', v_new_attempts,
    'locked_until', v_locked_until,
    'remaining_seconds', v_remaining_seconds
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Record successful login; clears lockout and reset attempts to 0
CREATE OR REPLACE FUNCTION public.record_successful_login(p_email TEXT)
RETURNS VOID AS $$
DECLARE
  v_hash TEXT;
BEGIN
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RETURN;
  END IF;
  v_hash := public.hash_login_identifier(p_email);
  DELETE FROM public.account_login_attempts WHERE identifier_hash = v_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Administrator unlock RPC
CREATE OR REPLACE FUNCTION public.admin_unlock_account(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_hash TEXT;
BEGIN
  v_hash := public.hash_login_identifier(p_email);
  DELETE FROM public.account_login_attempts WHERE identifier_hash = v_hash;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
