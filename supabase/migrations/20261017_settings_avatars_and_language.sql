-- ==============================================================================
-- Migration: 20261017_settings_avatars_and_language.sql
-- EMUFTI AI - Settings Redesign: Avatars Bucket, Preferred Language, Theme & RLS
-- ==============================================================================

-- 1. Ensure all Settings & Profile columns exist on public.profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'so',
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT 'SO',
  ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT 'emerald',
  ADD COLUMN IF NOT EXISTS interface_density TEXT DEFAULT 'comfortable',
  ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS reduced_motion BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Enforce preferred_language supported values: 'so', 'en', 'ar'
DO $$
BEGIN
  -- First sanitize any existing invalid values
  UPDATE public.profiles 
    SET preferred_language = 'so' 
    WHERE preferred_language IS NULL OR preferred_language NOT IN ('so', 'en', 'ar');

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_preferred_language_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_preferred_language_check
      CHECK (preferred_language IN ('so', 'en', 'ar'));
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 2. Ensure RLS on public.profiles permits authenticated users to update their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Storage Bucket for User Profile Avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  5242880, -- 5 MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- Storage RLS policies on storage.objects
DROP POLICY IF EXISTS "Public avatars are viewable by all" ON storage.objects;
CREATE POLICY "Public avatars are viewable by all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Authenticated users can update own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Authenticated users can delete own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 4. User Security Audit Trail Table
CREATE TABLE IF NOT EXISTS public.user_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  device_info TEXT,
  description TEXT,
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

-- 5. Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
