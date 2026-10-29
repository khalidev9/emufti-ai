-- ==============================================================================
-- EMufti AI - Redesign & Production Features Migration
-- Migration: 20261014_redesign_features.sql
-- Target Project: ozvvxuzecwhlpbfongiy
--
-- 1. Storage bucket configuration for User Avatars with secure RLS policies.
-- 2. Privileged profile field protection (prevents user self-escalation of role/plan).
-- 3. Verified Islamic Sources catalog table with full-text and thematic indexes.
-- 4. Sheikh Lecture Transcripts catalog table with metadata and timestamps.
-- 5. Enhanced RLS policies and performance indexes for response_feedback and reports.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. AVATAR STORAGE BUCKET & POLICIES
-- Create avatars bucket in Supabase storage if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  2097152, -- 2 Megabytes limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

-- Storage RLS on storage.objects
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

-- 3. PRIVILEGED PROFILE FIELD PROTECTION TRIGGER
-- Ensure regular users can never modify their own role, plan, or plan_activated_at
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If non-admin attempts to change role, plan, or activation timestamp, restore previous values
  IF (OLD.role IS DISTINCT FROM NEW.role OR OLD.plan IS DISTINCT FROM NEW.plan OR OLD.plan_activated_at IS DISTINCT FROM NEW.plan_activated_at) THEN
    IF NOT public.is_admin() THEN
      NEW.role := OLD.role;
      NEW.plan := OLD.plan;
      NEW.plan_activated_at := OLD.plan_activated_at;
    END IF;
  END IF;
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_fields();

-- 4. VERIFIED ISLAMIC SOURCES CATALOG
CREATE TABLE IF NOT EXISTS public.islamic_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('quran', 'tafsir', 'hadith', 'scholarly_work', 'fiqh_ruling')),
  title TEXT NOT NULL,
  author_scholar TEXT,
  reference TEXT NOT NULL,
  text_ar TEXT,
  text_en TEXT,
  text_so TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.islamic_sources ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.islamic_sources TO anon, authenticated;
GRANT ALL ON public.islamic_sources TO authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can view Islamic sources" ON public.islamic_sources;
CREATE POLICY "Anyone can view Islamic sources"
  ON public.islamic_sources FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage Islamic sources" ON public.islamic_sources;
CREATE POLICY "Admins can manage Islamic sources"
  ON public.islamic_sources FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_islamic_sources_type ON public.islamic_sources(type);
CREATE INDEX IF NOT EXISTS idx_islamic_sources_ref ON public.islamic_sources(reference);

-- Seed core sources if table is empty
INSERT INTO public.islamic_sources (type, title, author_scholar, reference, text_ar, text_en, text_so, tags)
VALUES
  (
    'quran',
    'Surah Al-Baqarah (2:43)',
    'Divine Revelation',
    'Surah Al-Baqarah 2:43',
    'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ',
    'And establish prayer and give zakah and bow with those who bow.',
    'Ooga salaadda oo bixiya zakada oo la rukuuca kuwa rukuucaya.',
    ARRAY['salah', 'zakat', 'pillars', 'worship']
  ),
  (
    'quran',
    'Surah Al-Baqarah (2:183)',
    'Divine Revelation',
    'Surah Al-Baqarah 2:183',
    'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
    'O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous.',
    'Kuwa xaqa rumeeyow waxaa laydinku waajibiyay soonka sidii loogu waajibiyay kuwii idinka horreeyay si aad u cabsataan.',
    ARRAY['sawm', 'fasting', 'ramadan', 'taqwa']
  ),
  (
    'hadith',
    'Pillars of Islam',
    'Abdullah ibn Umar (Sahih al-Bukhari)',
    'Sahih al-Bukhari 8',
    'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ...',
    'Islam is built upon five pillars: testifying that there is no deity worthy of worship except Allah and that Muhammad is His Messenger, establishing prayer, giving zakah, pilgrimage to the House, and fasting Ramadan.',
    'Islaamka waxaa lagu dhisay shan: Qirashada inaan Ilaah jirin aan Alle ahayn Maxammadna yahay Rasuulkiisa, Oogidda salaadda, Bixinta zakada, Xajka Beytka, iyo Soonka Ramadaan.',
    ARRAY['hadith', 'pillars', 'salah', 'zakat', 'sawm', 'hajj']
  )
ON CONFLICT DO NOTHING;

-- 5. SHEIKH LECTURE TRANSCRIPTS CATALOG
CREATE TABLE IF NOT EXISTS public.lecture_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheikh_name TEXT NOT NULL,
  lesson_title TEXT NOT NULL,
  series_name TEXT,
  language TEXT NOT NULL DEFAULT 'so' CHECK (language IN ('so', 'ar', 'en')),
  timestamp_seconds INTEGER DEFAULT 0,
  transcript_text TEXT NOT NULL,
  source_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.lecture_transcripts ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.lecture_transcripts TO anon, authenticated;
GRANT ALL ON public.lecture_transcripts TO authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can view lecture transcripts" ON public.lecture_transcripts;
CREATE POLICY "Anyone can view lecture transcripts"
  ON public.lecture_transcripts FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage lecture transcripts" ON public.lecture_transcripts;
CREATE POLICY "Admins can manage lecture transcripts"
  ON public.lecture_transcripts FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_lecture_transcripts_sheikh ON public.lecture_transcripts(sheikh_name);
CREATE INDEX IF NOT EXISTS idx_lecture_transcripts_title ON public.lecture_transcripts(lesson_title);

-- Seed core verified lecture transcript
INSERT INTO public.lecture_transcripts (sheikh_name, lesson_title, series_name, language, timestamp_seconds, transcript_text, tags)
VALUES
  (
    'Sheikh Umal',
    'Sharaxa Arkaanta Islaamka & Shuruudaha Salaadda',
    'Duruusta Caqiidada & Fiqiga',
    'so',
    120,
    'Salaaddu waa tiirka ugu weyn shahaadada ka dib. Qofka salaadda tukanaya waxaa waajib ku ah inuu ilaaliyo shuruudaha salaadda oo ay kow ka tahay daahirnimada xagga jirka, dharka iyo meesha lagu tukanayo...',
    ARRAY['fiqh', 'salah', 'shuruudaha', 'shafi']
  )
ON CONFLICT DO NOTHING;

-- 6. RESPONSE FEEDBACK & REPORTS INDEXES & POLICIES
CREATE INDEX IF NOT EXISTS idx_feedback_msg ON public.response_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status, created_at DESC);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
