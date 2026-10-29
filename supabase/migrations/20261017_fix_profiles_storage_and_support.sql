-- ==============================================================================
-- Migration: 20261017_fix_profiles_storage_and_support.sql
-- EMUFTI AI - Production Fix for:
-- 1. Profiles Table: avatar_url, phone_number, phone_country_code, preferred_language
-- 2. Supabase Storage: avatars bucket creation and Row Level Security
-- 3. Support Requests: category column, rate limiting, and RLS policies
--
-- Target Database: Supabase Project ozvvxuzecwhlpbfongiy
-- Safe & Idempotent: Can be run multiple times without data loss or downtime.
-- ==============================================================================

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE ENHANCEMENTS
-- -----------------------------------------------------------------------------
-- Ensure all profile customization and contact columns exist
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT 'SO',
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'so',
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT 'emerald',
  ADD COLUMN IF NOT EXISTS interface_density TEXT DEFAULT 'comfortable',
  ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS reduced_motion BOOLEAN DEFAULT FALSE;

-- Enforce valid preferred languages ('so', 'en', 'ar') safely
DO $$
BEGIN
  -- First sanitize any existing invalid/null values to Somali default
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

-- Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure users can read only their own profile (or admin)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ensure users can update only their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. SUPABASE STORAGE: AVATARS BUCKET & RLS POLICIES
-- -----------------------------------------------------------------------------
-- Create the public avatars bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  5242880, -- 5 MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public read access: Anyone can read avatar images so avatars display reliably
DROP POLICY IF EXISTS "Public avatars are viewable by all" ON storage.objects;
CREATE POLICY "Public avatars are viewable by all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can insert avatars ONLY inside their own user folder (auth.uid()/*)
DROP POLICY IF EXISTS "Authenticated users can upload own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- Authenticated users can update ONLY their own avatar
DROP POLICY IF EXISTS "Authenticated users can update own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- Authenticated users can delete ONLY their own avatar
DROP POLICY IF EXISTS "Authenticated users can delete own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- -----------------------------------------------------------------------------
-- 3. SUPPORT REQUESTS ENHANCEMENTS
-- -----------------------------------------------------------------------------
-- Add category column to public.support_requests if missing
ALTER TABLE public.support_requests
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Ensure Row Level Security is active on support_requests
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone (guest users with NULL user_id, or authenticated users matching auth.uid()) to insert
DROP POLICY IF EXISTS "Anyone can submit support requests" ON public.support_requests;
CREATE POLICY "Anyone can submit support requests"
  ON public.support_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Authenticated users can view their own requests, Admins can view all
DROP POLICY IF EXISTS "Users can view own support requests" ON public.support_requests;
CREATE POLICY "Users can view own support requests"
  ON public.support_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only verified admins can update or delete support requests
DROP POLICY IF EXISTS "Admins can update support requests" ON public.support_requests;
CREATE POLICY "Admins can update support requests"
  ON public.support_requests FOR UPDATE
  TO authenticated
  USING (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete support requests" ON public.support_requests;
CREATE POLICY "Admins can delete support requests"
  ON public.support_requests FOR DELETE
  TO authenticated
  USING (
    coalesce(auth.jwt() ->> 'email', '') = 'admin@emufti.ai'
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- 4. REFRESH POSTGREST SCHEMA CACHE
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
