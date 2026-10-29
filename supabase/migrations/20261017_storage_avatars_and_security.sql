-- ==============================================================================
-- Migration: 20261017_storage_avatars_and_security.sql
-- EMUFTI AI - Storage Avatars Bucket, Security Activity Events & Language Constraints
-- ==============================================================================

-- 1. Ensure preferred_language in public.profiles supports and enforces ('so', 'en', 'ar')
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_preferred_language_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_preferred_language_check
      CHECK (preferred_language IN ('so', 'en', 'ar'));
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- In case existing records have unmigrated values, sanitize first
  UPDATE public.profiles SET preferred_language = 'en' WHERE preferred_language NOT IN ('so', 'en', 'ar');
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_preferred_language_check
    CHECK (preferred_language IN ('so', 'en', 'ar'));
END $$;

-- 2. Storage bucket configuration for User Profile Avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  5242880, -- 5 Megabytes
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- Storage RLS on storage.objects
-- Public view policy
DROP POLICY IF EXISTS "Public avatars are viewable by all" ON storage.objects;
CREATE POLICY "Public avatars are viewable by all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated upload policy: user can only upload to their own user_id directory
DROP POLICY IF EXISTS "Authenticated users can upload own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- Authenticated update policy: user can only update their own files
DROP POLICY IF EXISTS "Authenticated users can update own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- Authenticated delete policy: user can only delete their own files
DROP POLICY IF EXISTS "Authenticated users can delete own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 3. Genuine Security Activity Log table
CREATE TABLE IF NOT EXISTS public.user_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  device_info TEXT,
  ip_approx_city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own security events" ON public.user_security_events;
CREATE POLICY "Users can view own security events"
  ON public.user_security_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own security events" ON public.user_security_events;
CREATE POLICY "Users can insert own security events"
  ON public.user_security_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_security_events_user_id 
  ON public.user_security_events(user_id, created_at DESC);
