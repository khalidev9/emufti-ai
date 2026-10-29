-- ==============================================================================
-- Migration: 20261017_profile_phone_and_settings.sql
-- EMUFTI AI - International Phone Registration, Accent Color, Density & Storage Policies
-- ==============================================================================

-- 1. Ensure phone_number, phone_country_code, accent_color, interface_density exist in public.profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT 'SO',
  ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT 'emerald',
  ADD COLUMN IF NOT EXISTS interface_density TEXT DEFAULT 'comfortable';

-- 2. Update handle_new_user trigger to populate phone metadata upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    display_name,
    preferred_language,
    phone_number,
    phone_country_code,
    theme,
    role
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'en'),
    COALESCE(new.raw_user_meta_data->>'phone_number', new.phone),
    COALESCE(new.raw_user_meta_data->>'phone_country_code', 'SO'),
    'system',
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    phone_number = COALESCE(public.profiles.phone_number, EXCLUDED.phone_number),
    phone_country_code = COALESCE(public.profiles.phone_country_code, EXCLUDED.phone_country_code);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Storage bucket configuration for User Avatars with secure RLS policies
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

-- Storage RLS on storage.objects:
-- Public can view avatars (avatars bucket is public)
DROP POLICY IF EXISTS "Public avatars are viewable by all" ON storage.objects;
CREATE POLICY "Public avatars are viewable by all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can only upload into their own folder: {userId}/{filename}
DROP POLICY IF EXISTS "Authenticated users can upload own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- Authenticated users can only update files in their own folder: {userId}/{filename}
DROP POLICY IF EXISTS "Authenticated users can update own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- Authenticated users can only delete files in their own folder: {userId}/{filename}
DROP POLICY IF EXISTS "Authenticated users can delete own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 4. Verify RLS policies on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Maintain existing privileged fields protection trigger
DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_fields();
