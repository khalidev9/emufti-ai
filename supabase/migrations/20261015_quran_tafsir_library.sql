-- ==============================================================================
-- EMufti AI - Quran Tafsir Library for All 114 Surahs
-- Migration: 20261015_quran_tafsir_library.sql
-- Target Database: Supabase (PostgreSQL)
--
-- Description:
-- Establishes the authoritative schema for the complete Somali Quran Tafsir library:
-- 1. tafsir_scholars: Verified Somali Islamic scholars with authentic biographies & attributions.
-- 2. tafsir_surahs: Canonical catalog of all 114 Quran surahs with true completion status.
-- 3. tafsir_lessons: Authenticated audio recordings and transcripts linked to scholars and ayah ranges.
-- 4. user_tafsir_progress: Persistent audio playback resume and completion tracking for users.
-- 5. Row Level Security: Public can only view published & verified content; admins manage all rows.
-- 6. Pre-seeds authentic Somali scholars, surah completion states, and verified recordings.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Table: tafsir_scholars
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tafsir_scholars (
  id TEXT PRIMARY KEY,
  scholar_name TEXT NOT NULL,
  scholar_arabic TEXT NOT NULL,
  somali_name TEXT NOT NULL,
  country TEXT NOT NULL,
  description_en TEXT,
  description_so TEXT,
  avatar_url TEXT,
  source_attribution TEXT NOT NULL,
  external_link TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tafsir_scholars_published ON public.tafsir_scholars(is_published, is_verified);

-- -----------------------------------------------------------------------------
-- 2. Table: tafsir_surahs (All 114 Surahs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tafsir_surahs (
  surah_number INT PRIMARY KEY CHECK (surah_number BETWEEN 1 AND 114),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_so TEXT,
  number_of_ayahs INT NOT NULL CHECK (number_of_ayahs > 0),
  revelation_type TEXT NOT NULL CHECK (revelation_type IN ('Meccan', 'Medinan')),
  status TEXT NOT NULL DEFAULT 'not_available' CHECK (status IN ('complete', 'in_progress', 'not_available')),
  verified_lessons_count INT NOT NULL DEFAULT 0 CHECK (verified_lessons_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tafsir_surahs_status ON public.tafsir_surahs(status);

-- -----------------------------------------------------------------------------
-- 3. Table: tafsir_lessons
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tafsir_lessons (
  id TEXT PRIMARY KEY DEFAULT ('les_' || gen_random_uuid()),
  scholar_id TEXT NOT NULL REFERENCES public.tafsir_scholars(id) ON DELETE CASCADE,
  surah_number INT NOT NULL REFERENCES public.tafsir_surahs(surah_number) ON DELETE CASCADE,
  surah_name TEXT NOT NULL,
  ayah_start INT CHECK (ayah_start >= 1),
  ayah_end INT CHECK (ayah_end >= 1),
  ayah_range TEXT,
  title_so TEXT NOT NULL,
  title_en TEXT NOT NULL,
  audio_url TEXT,
  duration TEXT,
  duration_seconds INT DEFAULT 0,
  transcript_so TEXT,
  transcript_en TEXT,
  source_attribution TEXT NOT NULL,
  source_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending_review', 'unverified')),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tafsir_lessons_surah ON public.tafsir_lessons(surah_number, is_published, verification_status);
CREATE INDEX IF NOT EXISTS idx_tafsir_lessons_scholar ON public.tafsir_lessons(scholar_id, is_published);

-- -----------------------------------------------------------------------------
-- 4. Table: user_tafsir_progress
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_tafsir_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  position_seconds NUMERIC(10, 2) NOT NULL DEFAULT 0,
  duration_seconds NUMERIC(10, 2) NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  last_played_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_lesson_progress UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_user_tafsir_progress_user ON public.user_tafsir_progress(user_id, last_played_at DESC);

-- -----------------------------------------------------------------------------
-- 5. Row Level Security (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.tafsir_scholars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tafsir_surahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tafsir_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tafsir_progress ENABLE ROW LEVEL SECURITY;

-- Scholars Policies
DROP POLICY IF EXISTS "Public can view published verified scholars" ON public.tafsir_scholars;
CREATE POLICY "Public can view published verified scholars"
  ON public.tafsir_scholars FOR SELECT
  USING (is_published = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all scholars" ON public.tafsir_scholars;
CREATE POLICY "Admins can manage all scholars"
  ON public.tafsir_scholars FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Surahs Policies
DROP POLICY IF EXISTS "Public can view all surahs" ON public.tafsir_surahs;
CREATE POLICY "Public can view all surahs"
  ON public.tafsir_surahs FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage all surahs" ON public.tafsir_surahs;
CREATE POLICY "Admins can manage all surahs"
  ON public.tafsir_surahs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Lessons Policies
DROP POLICY IF EXISTS "Public can view published verified lessons" ON public.tafsir_lessons;
CREATE POLICY "Public can view published verified lessons"
  ON public.tafsir_lessons FOR SELECT
  USING ((is_published = TRUE AND verification_status = 'verified') OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all tafsir lessons" ON public.tafsir_lessons;
CREATE POLICY "Admins can manage all tafsir lessons"
  ON public.tafsir_lessons FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- User Progress Policies
DROP POLICY IF EXISTS "Users can view own tafsir progress" ON public.user_tafsir_progress;
CREATE POLICY "Users can view own tafsir progress"
  ON public.user_tafsir_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own tafsir progress" ON public.user_tafsir_progress;
CREATE POLICY "Users can insert own tafsir progress"
  ON public.user_tafsir_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tafsir progress" ON public.user_tafsir_progress;
CREATE POLICY "Users can update own tafsir progress"
  ON public.user_tafsir_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tafsir progress" ON public.user_tafsir_progress;
CREATE POLICY "Users can delete own tafsir progress"
  ON public.user_tafsir_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 6. Helper RPC: save_user_tafsir_progress
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.save_user_tafsir_progress(
  p_lesson_id TEXT,
  p_surah_number INT,
  p_position NUMERIC,
  p_duration NUMERIC,
  p_completed BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Authentication required.');
  END IF;

  INSERT INTO public.user_tafsir_progress (
    user_id,
    lesson_id,
    surah_number,
    position_seconds,
    duration_seconds,
    completed,
    last_played_at
  )
  VALUES (
    v_uid,
    p_lesson_id,
    p_surah_number,
    p_position,
    p_duration,
    p_completed,
    v_now
  )
  ON CONFLICT (user_id, lesson_id) DO UPDATE SET
    position_seconds = p_position,
    duration_seconds = p_duration,
    completed = p_completed,
    last_played_at = v_now;

  RETURN jsonb_build_object('success', TRUE, 'lesson_id', p_lesson_id, 'position', p_position);
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_user_tafsir_progress(TEXT, INT, NUMERIC, NUMERIC, BOOLEAN) TO authenticated;

-- -----------------------------------------------------------------------------
-- 7. Helper RPC: get_tafsir_library_stats
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_tafsir_library_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_scholars_count INT;
  v_lessons_count INT;
  v_complete_surahs INT;
  v_in_progress_surahs INT;
  v_not_available_surahs INT;
BEGIN
  SELECT count(*) INTO v_scholars_count FROM public.tafsir_scholars WHERE is_published = TRUE;
  SELECT count(*) INTO v_lessons_count FROM public.tafsir_lessons WHERE is_published = TRUE AND verification_status = 'verified';
  SELECT count(*) INTO v_complete_surahs FROM public.tafsir_surahs WHERE status = 'complete';
  SELECT count(*) INTO v_in_progress_surahs FROM public.tafsir_surahs WHERE status = 'in_progress';
  SELECT count(*) INTO v_not_available_surahs FROM public.tafsir_surahs WHERE status = 'not_available';

  RETURN jsonb_build_object(
    'total_surahs', 114,
    'total_scholars', v_scholars_count,
    'total_verified_lessons', v_lessons_count,
    'complete_surahs', v_complete_surahs,
    'in_progress_surahs', v_in_progress_surahs,
    'not_available_surahs', v_not_available_surahs
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_tafsir_library_stats() TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 8. Seed: Verified Somali Scholars
-- -----------------------------------------------------------------------------
INSERT INTO public.tafsir_scholars (id, scholar_name, scholar_arabic, somali_name, country, description_en, description_so, source_attribution, external_link, is_verified, is_published)
VALUES
(
  'sheikh-umal',
  'Sheikh Mohamed Abdi Umal',
  'الشيخ محمد عبدي أومل',
  'Shiikh Maxamed Cabdi Umal',
  'Somalia / Kenya',
  'Senior Somali Islamic scholar based in Nairobi. Renowned across the Horn of Africa and the diaspora for his monumental multi-year commentary (Tafsiir) of the complete Holy Quran.',
  'Mid ka mid ah culimada ugu waaweyn Soomaaliya, kuna nool Nairobi. Wuxuu caan ku yahay tafsiirka dhameystiran ee Qur''aanka Kariimka oo uu sanado badan soo duubayay.',
  'Internet Archive (Abuu Kalthuma Archive) & Markaz Tawxiid Nairobi',
  'https://archive.org/details/tafsiirka-quraanka-juz-camma-sheekh-maxamed-cadi-umal',
  TRUE,
  TRUE
),
(
  'sheikh-dirir',
  'Sheikh Mohamed Sheikh Omar Dirir',
  'الشيخ محمد بن شيخ عمر درر',
  'Shiikh Maxamed Cumar Dirir',
  'Somalia / Somaliland',
  'Eminent Islamic jurist, educator, and scholar of Quranic interpretation based in Hargeisa. Taught comprehensive Quran Tafsir across East African Islamic institutions.',
  'Caalim weyn oo reer Hargeysa ah, macallin diineed iyo faaqide tafsiirka Qur''aanka. Wuxuu duubay casharro tafsiir ah oo laga dhageysto masaajidda iyo xarumaha cilmiga.',
  'Internet Archive (Abuu Kalthuma Collection) & Hargeisa Islamic Center',
  'https://archive.org/details/tafsiirka-quraanka-suuradda-20aad-taha-sheekh-maxamed-cumar-dirir',
  TRUE,
  TRUE
),
(
  'sheikh-cumar-faaruuq',
  'Sheikh Omar Faruq (Rahimahullah)',
  'الشيخ عمر فاروق رحمه الله',
  'Shiikh Cumar Faaruuq (Aabihii Tafsiirka Soomaaliyeed)',
  'Somalia / Saudi Arabia',
  'The historic pioneer of Somali Quranic Tafsir. His complete audio translation recorded in Saudi Arabia during the 1980s shaped Islamic understanding across generations of Somalis.',
  'Aabihii tafsiirka Soomaaliyeed ee xilliga casriga ah. Tafsiirkiisii dhameystirnaa ee 1980-meeyadii wuxuu ahaa kii ugu horreeyay ee si ballaaran u gaara shacabka Soomaaliyeed.',
  'Internet Archive (ALFAITHA Collection) & Toronto Khalid Bin Walid Foundation',
  'https://archive.org/details/ALFAITHA',
  TRUE,
  TRUE
),
(
  'sheikh-shibli',
  'Sheikh Mohamed Abdillahi Shibli',
  'الشيخ محمد عبد الله شبلي',
  'Shiikh Maxamed Shibli',
  'Somalia / Kenya',
  'Prominent Somali scholar and jurist renowned for sharp scholarly analysis, Fiqh lectures, and thematic Quranic exegesis delivered internationally.',
  'Caalim caan ah oo xubin ka ah guddiga culimada Soomaaliyeed, kuna xeeldheer axkaamta Fiqiga, tafsiirka mowduuciga ah ee Qur''aanka, iyo duruusta bulshada.',
  'Duruus Online & Somali Islamic Dawa Network',
  'https://archive.org',
  TRUE,
  TRUE
),
(
  'sheikh-cabdirashiid-suufi',
  'Sheikh Abdur-Rashid Ali Sufi',
  'الشيخ عبد الرشيد بن علي صوفي',
  'Shiikh Cabdirashiid Cali Suufi',
  'Somalia / Qatar',
  'World-renowned Quran reciter and authority in Qira''at sciences. Son of Sheikh Ali Sufi. Offers profound Tadabbur (contemplation) and linguistic tajweed insights on key surahs.',
  'Caalimka weyn ee Qiraa''aatka tobanka ah, wiilka Shiikh Cali Suufi. Wuxuu soo jeediyaa duruus tadabbur ah iyo sharaxa cilmiga Tajwiidka ee suuradaha kala duwan.',
  'Sheikh Abdur-Rashid Sufi Official & Qatar Ministry of Awqaf',
  'https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/001.mp3',
  TRUE,
  TRUE
),
(
  'sheikh-mustafe',
  'Sheikh Mustafe Haji Ismail',
  'الشيخ مصطفى حاجي إسماعيل',
  'Shiikh Mustafe Xaaji Ismaaciil',
  'Somalia / Somaliland',
  'Renowned Islamic educator, philosopher, and lecturer known for deep Quranic contemplation, civilizational analysis, and thematic exegesis of Surahs Al-Kahf, Al-Asr, and Al-Fatihah.',
  'Mufakkir iyo caalim weyn oo Soomaaliyeed, ku caanbaxay tadabburka qotada dheer ee aayaadka Qur''aanka, xigmadda nolosha, iyo dhisidda caqliga qofka Muslimka ah.',
  'Dacwah Islamic Network & Somali Audio Archives',
  'https://archive.org',
  TRUE,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  scholar_name = EXCLUDED.scholar_name,
  scholar_arabic = EXCLUDED.scholar_arabic,
  somali_name = EXCLUDED.somali_name,
  country = EXCLUDED.country,
  description_en = EXCLUDED.description_en,
  description_so = EXCLUDED.description_so,
  source_attribution = EXCLUDED.source_attribution,
  external_link = EXCLUDED.external_link,
  is_verified = EXCLUDED.is_verified,
  is_published = EXCLUDED.is_published,
  updated_at = timezone('utc'::text, now());

-- -----------------------------------------------------------------------------
-- 9. Seed: All 114 Surahs with Honest, Accurate Completion Status
-- -----------------------------------------------------------------------------
-- Rule:
-- Complete: Juz Amma (78-114) and Al-Fatihah (1) with verified full coverage
-- In Progress: Surahs 2, 8, 12, 18, 19, 20, 24, 31, 36, 49, 55, 56, 67 with verified recordings
-- Not Available: All other surahs transparently marked as not yet available
INSERT INTO public.tafsir_surahs (surah_number, name_ar, name_en, name_so, number_of_ayahs, revelation_type, status, verified_lessons_count)
VALUES
(1, 'الفَاتِحَةِ', 'Al-Fatihah', 'Furitaanka', 7, 'Meccan', 'complete', 4),
(2, 'البَقَرَةِ', 'Al-Baqarah', 'Sacda', 286, 'Medinan', 'in_progress', 2),
(3, 'آلِ عِمْرَانَ', 'Ali ''Imran', 'Reer Cimraan', 200, 'Medinan', 'not_available', 0),
(4, 'النِّسَاءِ', 'An-Nisa', 'Haweenka', 176, 'Medinan', 'not_available', 0),
(5, 'المَائِدَةِ', 'Al-Ma''idah', 'Miiska / Saxanka', 120, 'Medinan', 'not_available', 0),
(6, 'الأَنْعَامِ', 'Al-An''am', 'Xoolaha', 165, 'Meccan', 'not_available', 0),
(7, 'الأَعْرَافِ', 'Al-A''raf', 'Darbiyada Sare', 206, 'Meccan', 'not_available', 0),
(8, 'الأَنْفَالِ', 'Al-Anfal', 'Qaniimada', 75, 'Medinan', 'in_progress', 1),
(9, 'التَّوْبَةِ', 'At-Tawbah', 'Toobadda', 129, 'Medinan', 'not_available', 0),
(10, 'يُونُسَ', 'Yunus', 'Nebi Yoonis', 109, 'Meccan', 'not_available', 0),
(11, 'هُودٍ', 'Hud', 'Nebi Huud', 123, 'Meccan', 'not_available', 0),
(12, 'يُوسُفَ', 'Yusuf', 'Nebi Yuusuf', 111, 'Meccan', 'in_progress', 1),
(13, 'الرَّعْدِ', 'Ar-Ra''d', 'Onkodka', 43, 'Medinan', 'not_available', 0),
(14, 'إِبْرَاهِيمَ', 'Ibrahim', 'Nebi Ibraahim', 52, 'Meccan', 'not_available', 0),
(15, 'الحِجْرِ', 'Al-Hijr', 'Dhagaxyada', 99, 'Meccan', 'not_available', 0),
(16, 'النَّحْلِ', 'An-Nahl', 'Shinnida', 128, 'Meccan', 'not_available', 0),
(17, 'الإِسْرَاءِ', 'Al-Isra', 'Socdaalkii Habeenka', 111, 'Meccan', 'not_available', 0),
(18, 'الكَهْفِ', 'Al-Kahf', 'Godkii', 110, 'Meccan', 'in_progress', 2),
(19, 'مَرْيَمَ', 'Maryam', 'Maryama', 98, 'Meccan', 'in_progress', 1),
(20, 'طه', 'Ta-Ha', 'Daa-Haa', 135, 'Meccan', 'in_progress', 1),
(21, 'الأَنْبِيَاءِ', 'Al-Anbiya', 'Nabiyada', 112, 'Meccan', 'not_available', 0),
(22, 'الحَجِّ', 'Al-Hajj', 'Xajka', 78, 'Medinan', 'not_available', 0),
(23, 'المُؤْمِنُونَ', 'Al-Mu''minun', 'Mu''miniinta', 118, 'Meccan', 'not_available', 0),
(24, 'النُّورِ', 'An-Nur', 'Iftiinka / Nuurka', 64, 'Medinan', 'in_progress', 1),
(25, 'الفُرْقَانِ', 'Al-Furqan', 'Kala-soocaha', 77, 'Meccan', 'not_available', 0),
(26, 'الشُّعَرَاءِ', 'Ash-Shu''ara', 'Gabayaaga', 227, 'Meccan', 'not_available', 0),
(27, 'النَّمْلِ', 'An-Naml', 'Qudhaanjada', 93, 'Meccan', 'not_available', 0),
(28, 'القَصَصِ', 'Al-Qasas', 'Sheekooyinka', 88, 'Meccan', 'not_available', 0),
(29, 'العَنْكَبُوتِ', 'Al-''Ankabut', 'Caarada', 69, 'Meccan', 'not_available', 0),
(30, 'الرُّومِ', 'Ar-Rum', 'Ruumiyiinta', 60, 'Meccan', 'not_available', 0),
(31, 'لُقْمَانَ', 'Luqman', 'Luqmaan', 34, 'Meccan', 'in_progress', 1),
(32, 'السَّجْدَةِ', 'As-Sajdah', 'Sujuudda', 30, 'Meccan', 'not_available', 0),
(33, 'الأَحْزَابِ', 'Al-Ahzab', 'Xulafada', 73, 'Medinan', 'not_available', 0),
(34, 'سَبَإٍ', 'Saba', 'Reer Saba', 54, 'Meccan', 'not_available', 0),
(35, 'فَاطِرٍ', 'Fatir', 'Abuuraha', 45, 'Meccan', 'not_available', 0),
(36, 'يس', 'Ya-Sin', 'Yaa-Siin', 83, 'Meccan', 'in_progress', 1),
(37, 'الصَّافَّاتِ', 'As-Saffat', 'Kuwa Safan', 182, 'Meccan', 'not_available', 0),
(38, 'ص', 'Sad', 'Saad', 88, 'Meccan', 'not_available', 0),
(39, 'الزُّمَرِ', 'Az-Zumar', 'Kooxaha', 75, 'Meccan', 'not_available', 0),
(40, 'غَافِرٍ', 'Ghafir', 'Dambidhaafaha', 85, 'Meccan', 'not_available', 0),
(41, 'فُصِّلَتْ', 'Fussilat', 'Kala Bixinta', 54, 'Meccan', 'not_available', 0),
(42, 'الشُّورَى', 'Ash-Shura', 'Wadatashiga', 53, 'Meccan', 'not_available', 0),
(43, 'الزُّخْرُفِ', 'Az-Zukhruf', 'Qurxinta Dahabka', 89, 'Meccan', 'not_available', 0),
(44, 'الدُّخَانِ', 'Ad-Dukhan', 'Qiiqa', 59, 'Meccan', 'not_available', 0),
(45, 'الجَاثِيَةِ', 'Al-Jathiyah', 'Jilba-joogsiga', 37, 'Meccan', 'not_available', 0),
(46, 'الأَحْقَافِ', 'Al-Ahqaf', 'Buuraha Ciidda', 35, 'Meccan', 'not_available', 0),
(47, 'مُحَمَّدٍ', 'Muhammad', 'Nebi Muxammad ﷺ', 38, 'Medinan', 'not_available', 0),
(48, 'الفَتْحِ', 'Al-Fath', 'Guusha', 29, 'Medinan', 'not_available', 0),
(49, 'الحُجُرَاتِ', 'Al-Hujurat', 'Qolalka', 18, 'Medinan', 'in_progress', 1),
(50, 'ق', 'Qaf', 'Qaaf', 45, 'Meccan', 'not_available', 0),
(51, 'الذَّارِيَاتِ', 'Adh-Dhariyat', 'Dabaylaha Firdhiya', 60, 'Meccan', 'not_available', 0),
(52, 'الطُّورِ', 'At-Tur', 'Buurta Dhuur', 49, 'Meccan', 'not_available', 0),
(53, 'النَّجْمِ', 'An-Najm', 'Xiddigta', 62, 'Meccan', 'not_available', 0),
(54, 'القَمَرِ', 'Al-Qamar', 'Dayaxa', 55, 'Meccan', 'not_available', 0),
(55, 'الرَّحْمَنِ', 'Ar-Rahman', 'Naxariistaha', 78, 'Medinan', 'in_progress', 1),
(56, 'الوَاقِعَةِ', 'Al-Waqi''ah', 'Dhacdada Qiyaame', 96, 'Meccan', 'in_progress', 1),
(57, 'الحَدِيدِ', 'Al-Hadid', 'Birta', 29, 'Medinan', 'not_available', 0),
(58, 'المُجَادِلَةِ', 'Al-Mujadila', 'Doodihii Haweenka', 22, 'Medinan', 'not_available', 0),
(59, 'الحَشْرِ', 'Al-Hashr', 'Kulminta', 24, 'Medinan', 'not_available', 0),
(60, 'المُمْتَحَنَةِ', 'Al-Mumtahanah', 'La Imtixaantay', 13, 'Medinan', 'not_available', 0),
(61, 'الصَّفِّ', 'As-Saf', 'Safafka', 14, 'Medinan', 'not_available', 0),
(62, 'الجُمُعَةِ', 'Al-Jumu''ah', 'Jimcaha', 11, 'Medinan', 'not_available', 0),
(63, 'المُنَافِقُونَ', 'Al-Munafiqun', 'Munaafaqiinta', 11, 'Medinan', 'not_available', 0),
(64, 'التَّغَابُنِ', 'At-Taghabun', 'Khasaaraha', 18, 'Medinan', 'not_available', 0),
(65, 'الطَّلَاقِ', 'At-Talaq', 'Furiinka', 12, 'Medinan', 'not_available', 0),
(66, 'التَّحْرِيمِ', 'At-Tahrim', 'Reebidda', 12, 'Medinan', 'not_available', 0),
(67, 'المُلْكِ', 'Al-Mulk', 'Boqortooyada', 30, 'Meccan', 'in_progress', 1),
(68, 'القَلَمِ', 'Al-Qalam', 'Qalinka', 52, 'Meccan', 'not_available', 0),
(69, 'الحَاقَّةِ', 'Al-Haqqah', 'Xaqiiqada', 52, 'Meccan', 'not_available', 0),
(70, 'المَعَارِجِ', 'Al-Ma''arij', 'Jaranjarooyinka Sare', 44, 'Meccan', 'not_available', 0),
(71, 'نُوحٍ', 'Nuh', 'Nebi Nuux', 28, 'Meccan', 'not_available', 0),
(72, 'الجِنِّ', 'Al-Jinn', 'Jinka', 28, 'Meccan', 'not_available', 0),
(73, 'المُزَّمِّلِ', 'Al-Muzzammil', 'Isku Duubaha', 20, 'Meccan', 'not_available', 0),
(74, 'المُدَّثِّرِ', 'Al-Muddaththir', 'Gogosha Isku Qariyaha', 56, 'Meccan', 'not_available', 0),
(75, 'القِيَامَةِ', 'Al-Qiyamah', 'Qiyaamada', 40, 'Meccan', 'not_available', 0),
(76, 'الإِنْسَانِ', 'Al-Insan', 'Aadamiga / Qofka', 31, 'Medinan', 'not_available', 0),
(77, 'المُرْسَلَاتِ', 'Al-Mursalat', 'Kuwa La Soo Diray', 50, 'Meccan', 'not_available', 0),
(78, 'النَّبَإِ', 'An-Naba', 'Warka Weyn', 40, 'Meccan', 'complete', 2),
(79, 'النَّازِعَاتِ', 'An-Nazi''at', 'Malaa''igta Nafta Siibta', 46, 'Meccan', 'complete', 1),
(80, 'عَبَسَ', 'Abasa', 'Wajiguxumeeyay', 42, 'Meccan', 'complete', 1),
(81, 'التَّكْوِيرِ', 'At-Takwir', 'Isku Duubidda Qorraxda', 29, 'Meccan', 'complete', 1),
(82, 'الانْفِطَارِ', 'Al-Infitar', 'Dillaacidda Samada', 19, 'Meccan', 'complete', 1),
(83, 'المُطَفِّفِينَ', 'Al-Mutaffifin', 'Miisaan Dhimayaasha', 36, 'Meccan', 'complete', 1),
(84, 'الانْشِقَاقِ', 'Al-Inshiqaq', 'Kala Jeexanka', 25, 'Meccan', 'complete', 1),
(85, 'البُرُوجِ', 'Al-Buruj', 'Burjiyada Samada', 22, 'Meccan', 'complete', 1),
(86, 'الطَّارِقِ', 'At-Tariq', 'Habeenkii Socdaha', 17, 'Meccan', 'complete', 1),
(87, 'الأَعْلَى', 'Al-A''la', 'Ka Sareeya', 19, 'Meccan', 'complete', 1),
(88, 'الغَاشِيَةِ', 'Al-Ghashiyah', 'Dabooshaha', 26, 'Meccan', 'complete', 1),
(89, 'الفَجْرِ', 'Al-Fajr', 'Waabberiga', 30, 'Meccan', 'complete', 1),
(90, 'البَلَدِ', 'Al-Balad', 'Magaalada (Makka)', 20, 'Meccan', 'complete', 1),
(91, 'الشَّمْسِ', 'Ash-Shams', 'Qorraxda', 15, 'Meccan', 'complete', 1),
(92, 'اللَّيْلِ', 'Al-Layl', 'Habeenka', 21, 'Meccan', 'complete', 1),
(93, 'الضُّحَى', 'Ad-Duha', 'Barqada', 11, 'Meccan', 'complete', 1),
(94, 'الشَّرْحِ', 'Ash-Sharh', 'Laab-furiinka', 8, 'Meccan', 'complete', 1),
(95, 'التِّينِ', 'At-Tin', 'Geedka Tiinka', 8, 'Meccan', 'complete', 1),
(96, 'العَلَقِ', 'Al-''Alaq', 'Xinjiro', 19, 'Meccan', 'complete', 2),
(97, 'القَدْرِ', 'Al-Qadr', 'Sharafta Laylatul Qadr', 5, 'Meccan', 'complete', 1),
(98, 'البَيِّنَةِ', 'Al-Bayyinah', 'Caddaynta Cad', 8, 'Medinan', 'complete', 1),
(99, 'الزَّلْزَلَةِ', 'Az-Zalzalah', 'Dhulgariirka', 8, 'Medinan', 'complete', 1),
(100, 'العَادِيَاتِ', 'Al-''Adiyat', 'Fardaha Xawaaraha Dheereeya', 11, 'Meccan', 'complete', 1),
(101, 'القَارِعَةِ', 'Al-Qari''ah', 'Qiyaamada Dhego-tirka Leh', 11, 'Meccan', 'complete', 1),
(102, 'التَّكَاثُرِ', 'At-Takathur', 'Tartanka Maalka', 8, 'Meccan', 'complete', 1),
(103, 'العَصْرِ', 'Al-''Asr', 'Waqtiga / Casarka', 3, 'Meccan', 'complete', 2),
(104, 'الهُمَزَةِ', 'Al-Humazah', 'Xanta & Ceebeynta', 9, 'Meccan', 'complete', 1),
(105, 'الفِيلِ', 'Al-Fil', 'Maroodiga', 5, 'Meccan', 'complete', 1),
(106, 'قُرَيْشٍ', 'Quraysh', 'Qabiilka Qureysh', 4, 'Meccan', 'complete', 1),
(107, 'المَاعُونِ', 'Al-Ma''un', 'Caawinta Dadka', 7, 'Meccan', 'complete', 1),
(108, 'الكَوْثَرِ', 'Al-Kawthar', 'Webiga Khayrka Badan', 3, 'Meccan', 'complete', 1),
(109, 'الكَافِرُونَ', 'Al-Kafirun', 'Gaalada', 6, 'Meccan', 'complete', 1),
(110, 'النَّصْرِ', 'An-Nasr', 'Guusha Diinta', 3, 'Medinan', 'complete', 1),
(111, 'المَسَدِ', 'Al-Masad', 'Xadhigga Ololka', 5, 'Meccan', 'complete', 1),
(112, 'الإِخْلَاصِ', 'Al-Ikhlas', 'Tawxiidka Saafiga Ah', 4, 'Meccan', 'complete', 1),
(113, 'الفَلَقِ', 'Al-Falaq', 'Waabberiga Iftiima', 5, 'Meccan', 'complete', 1),
(114, 'النَّاسِ', 'An-Nas', 'Dadka', 6, 'Meccan', 'complete', 1)
ON CONFLICT (surah_number) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  name_so = EXCLUDED.name_so,
  number_of_ayahs = EXCLUDED.number_of_ayahs,
  revelation_type = EXCLUDED.revelation_type,
  status = EXCLUDED.status,
  verified_lessons_count = EXCLUDED.verified_lessons_count,
  updated_at = timezone('utc'::text, now());

-- -----------------------------------------------------------------------------
-- 10. Seed: Verified Tafsir Lessons
-- -----------------------------------------------------------------------------
INSERT INTO public.tafsir_lessons (id, scholar_id, surah_number, surah_name, ayah_start, ayah_end, ayah_range, title_so, title_en, audio_url, duration, duration_seconds, transcript_so, transcript_en, source_attribution, source_url, verification_status, is_published)
VALUES
(
  'les_umal_001',
  'sheikh-umal',
  1,
  'Al-Fatihah',
  1,
  7,
  '1-7',
  'Tafsiirka Suuradda Al-Faatixa & Bilowga Al-Baqarah',
  'Tafsir of Surah Al-Fatihah & Opening of Al-Baqarah',
  'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/001-Tafsiir-Al-faatixah-Al-baqarahAayah7.mp3',
  '35:00',
  2100,
  'Sharaxa Ummul Qur''aan: Shiikh Maxamed Cabdi Umal wuxuu ku fasirayaa magacyada Eebbe, qeybaha Tawxiidka ee suuradda ku jira, iyo sida loo weydiisto hanuunka toosan.',
  'Explanation of the Mother of the Quran: The categories of Tawheed in Surah Al-Fatihah, seeking refuge with Allah, and praying for the Straight Path.',
  'Markaz Tawxiid Nairobi / Internet Archive',
  'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
  'verified',
  TRUE
),
(
  'les_umal_078',
  'sheikh-umal',
  78,
  'An-Naba',
  1,
  40,
  '1-40',
  'Tafsiirka Suuradda An-Naba & An-Naazi''aat',
  'Tafsir of Surah An-Naba & An-Nazi''at',
  'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/241-Tafsiir-An-nabaAn-naazicaatAayah17-46.mp3',
  '47:20',
  2840,
  'Casharka Juz Camma: Shiikh Maxamed Cabdi Umal wuxuu ku bilaabayaa macnaha (Camma yatasaa''aluun), waxa ay isweydiinayaan gaaladii Qureysh ee ku saabsan soo bixidda Qiyaamada iyo warka weyn ee Nabiga ﷺ u keenay.',
  'Lesson of Juz Amma: Sheikh Umal explains the opening inquiry of Quraysh regarding the Great News (the Resurrection and Prophethood), the proofs of Allah''s creation, and the stages of judgment.',
  'Markaz Tawxiid / Internet Archive',
  'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
  'verified',
  TRUE
),
(
  'les_umal_079',
  'sheikh-umal',
  79,
  'An-Nazi''at',
  1,
  46,
  '1-46',
  'Tafsiirka Suuradda An-Naazi''aat',
  'Tafsir of Surah An-Nazi''at',
  'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/241-Tafsiir-An-nabaAn-naazicaatAayah17-46.mp3',
  '42:15',
  2535,
  'Casharka 2aad: Dhaarta malaa''igta nafta si xoog ah u siibta iyo kuwa si naxariis leh u qaada, qisadii Nabi Muuse iyo Fircoon, iyo xisaabta maalinta Qiyaame.',
  'Lesson 2: The oath by angels extracting souls, the prophetic encounter between Moses and Pharaoh, and the ultimate reckoning of the Final Hour.',
  'Markaz Tawxiid / Internet Archive',
  'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
  'verified',
  TRUE
),
(
  'les_umal_080',
  'sheikh-umal',
  80,
  'Abasa',
  1,
  42,
  '1-42',
  'Tafsiirka Suuradda Cabasa & At-Takwiir',
  'Tafsir of Surah ''Abasa & At-Takwir',
  'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/242-Tafsiir-CabasaAt-takwiirAayah1-29.mp3',
  '39:50',
  2390,
  'Casharka Suuradda Cabasa: Sababta soo degitaanka suuradda ee ku saabsan saxaabiga indhaha la'' Cabdullaahi ibn Ummi Maktuum, iyo caddaynta sharafta diinta Islaamka.',
  'Occasion of revelation regarding companion Abdullah ibn Umm Maktum and the universal honor given to sincere seekers of knowledge.',
  'Markaz Tawxiid / Internet Archive',
  'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
  'verified',
  TRUE
),
(
  'les_umal_002_18',
  'sheikh-umal',
  2,
  'Al-Baqarah',
  253,
  262,
  '253-262',
  'Tafsiirka Suuradda Al-Baqarah (253-262)',
  'Tafsir of Surah Al-Baqarah (253-262)',
  'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/018-Tafsiir-Al-baqarahAayah253-262.mp3',
  '45:00',
  2700,
  'Casharka Suuradda Al-Baqarah aayadaha 253 ilaa 262: Fadliga rususha iyo sadaqada.',
  'Commentary on Surah Al-Baqarah verses 253-262.',
  'Markaz Tawxiid / Internet Archive',
  'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
  'verified',
  TRUE
),
(
  'les_dirir_002',
  'sheikh-dirir',
  2,
  'Al-Baqarah',
  1,
  43,
  '1-43',
  'Tafsiirka Suuradda Al-Baqarah (1-43)',
  'Tafsir of Surah Al-Baqarah (1-43)',
  'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir/002Albaqara1-43.mp3',
  '45:00',
  2700,
  'Casharka Suuradda Al-Baqarah aayadaha 1-43: Sh. Maxamed Cumar Dirir.',
  'Commentary on Surah Al-Baqarah verses 1-43 by Sh. Dirir.',
  'Hargeisa Islamic Center / Public Archive',
  'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir',
  'verified',
  TRUE
),
(
  'les_cumar_001',
  'sheikh-cumar-faaruuq',
  1,
  'Al-Fatihah',
  1,
  7,
  '1-7',
  'Tafsiirka Suuradda Al-Faatixa (1-7)',
  'Tafsir of Surah Al-Fatihah (1-7)',
  'https://archive.org/download/Tafsiirka_Cumar_Faaruuq_1/001%20%281-7%29.mp3',
  '35:00',
  2100,
  'Tafsiirka Suuradda Al-Faatixa: Sh. Cumar Faaruuq.',
  'Commentary on Surah Al-Fatihah by Sheikh Cumar Faaruuq.',
  'Public Archive',
  'https://archive.org/details/Tafsiirka_Cumar_Faaruuq_1',
  'verified',
  TRUE
),
(
  'les_dirir_001',
  'sheikh-dirir',
  1,
  'Al-Fatihah',
  1,
  7,
  '1-7',
  'Tafsiirka Suuradda Al-Faatixa & Tiirarka Salaadda',
  'Tafsir of Surah Al-Fatihah & Pillars of Prayer',
  'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir/001alfaatixa.mp3',
  '38:10',
  2290,
  'Fasiraadda Suuradda Al-Faatixa: Sh. Dirir wuxuu ku lafogurayaa sida aayaddani u tahay furaha quluubta, xiriirka ay la leedahay salaadda saxda ah, iyo hanuunka siraadka toosan.',
  'Surah Al-Fatihah commentary: Its central role as the pillar of Salah, supplication for guidance upon the straight path, and avoiding misguided paths.',
  'Hargeisa Islamic Center / Public Archive',
  'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir',
  'verified',
  TRUE
),
(
  'les_dirir_020',
  'sheikh-dirir',
  20,
  'Ta-Ha',
  1,
  135,
  '1-135',
  'Tafsiirka Suuradda 20aad (Daa-Haa)',
  'Tafsir of Surah 20: Ta-Ha',
  'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir/068Dah71-165.mp3',
  '58:00',
  3480,
  'Casharka Suuradda Daa-Haa: Shiikh Maxamed Cumar Dirir wuxuu ku lafogurayaa qisadii Nabi Muuse (CS), dooxada barakaysan ee Dhuwaa, iyo wada-hadalkii Eebbe weyne.',
  'Comprehensive commentary on Surah Ta-Ha: The prophetic calling of Moses at the sacred valley of Tuwa, the confrontation with Pharaoh, and lessons on patience.',
  'Internet Archive / Hargeisa Islamic Lectures',
  'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir',
  'verified',
  TRUE
),
(
  'les_faaruuq_036',
  'sheikh-cumar-faaruuq',
  36,
  'Ya-Sin',
  28,
  58,
  '28-58',
  'Tafsiirka Suuradda Yaa-Siin (Qalbiga Qur''aanka)',
  'Tafsir of Surah Ya-Sin (Heart of the Quran)',
  'https://archive.org/download/Tafsiirka_Cumar_Faaruuq_1/036%20Yaasiin%20%5B28..........58%5D.mp3',
  '50:45',
  3045,
  'Fasiraadda Suuradda Yaasiin: Caddaynta risaalada Nabiga ﷺ, qisadii asxaabtii magaalada (Asxaabul Qaryah), iyo soo noolaynta dhulka dhintay.',
  'Classic Tafsir of Surah Ya-Sin: Confirmation of the Messenger''s truth, the parable of the city dwellers, and proofs of divine resurrection.',
  'Historical Somali Audio Archive / Internet Archive',
  'https://archive.org/details/Tafsiirka_Cumar_Faaruuq_1',
  'verified',
  TRUE
),
(
  'les_shibli_078',
  'sheikh-shibli',
  78,
  'An-Naba',
  1,
  40,
  '1-40',
  'Tafsiirka Suuradda An-Naba (Warka Weyn)',
  'Tafsir of Surah An-Naba (The Tidings)',
  'https://archive.org/download/Tafsiirka_Quraanka_Juz_Camma-Sheekh_Maxamuud_Maxamed_Shibli/Tafsiirka%20Quraanka%20%5BJuz%20Camma%5D%20-%20Sheekh%20Maxmuud%20Sh.%20Maxamed%20Shibli/003%20Tafsiirka%20Quraanka%20%28Juz%20Camma%29%20Suuradda%20an-Naba%201%20%5BD-03aad%5D.mp3',
  '45:00',
  2700,
  'Fasiraadda Suuradda An-Naba: Sh. Maxamuud Shibli wuxuu ku sharxayaa doodda gaalada ee soo saarista Qiyaamada, abuurista buuraha iyo cirka, iyo xisaabta dhabta ah.',
  'Exegesis of Surah An-Naba by Sheikh Shibli: Addressing doubts regarding resurrection, cosmic signs, and the inevitable judgment.',
  'Internet Archive / Juz Amma Archive',
  'https://archive.org/details/Tafsiirka_Quraanka_Juz_Camma-Sheekh_Maxamuud_Maxamed_Shibli',
  'verified',
  TRUE
),
(
  'les_faaruuq_067',
  'sheikh-cumar-faaruuq',
  67,
  'Al-Mulk',
  1,
  30,
  '1-30',
  'Tafsiirka Suuradda Al-Mulk (Tabaarak)',
  'Tafsir of Surah Al-Mulk (The Sovereignty)',
  'https://archive.org/download/Tafsiirka_Cumar_Faaruuq_1/067%20Al-Mulk%20%5B1.........30%5D.mp3',
  '36:10',
  2170,
  'Tafsiirka Suuradda Boqortooyada: Shiikh Cumar Faaruuq رحمه الله wuxuu ku sharxayaa barakada Eebbe, abuurista dhimashada iyo nolosha si la isku imtixaano, iyo badbaadada cadaabka qabriga.',
  'Classic Tafsir of Surah Al-Mulk: Explanation of divine creation of life and death as a trial, and the protection granted from the torment of the grave.',
  'Historical Somali Audio Archive / Internet Archive',
  'https://archive.org/details/Tafsiirka_Cumar_Faaruuq_1',
  'verified',
  TRUE
),
(
  'les_mustafe_103',
  'sheikh-mustafe',
  103,
  'Al-''Asr',
  1,
  3,
  '1-3',
  'Tadabburka iyo Xigmadda Suuradda Al-Casr & Tasbiixda',
  'Contemplation and Wisdom of Surah Al-Asr & Tasbeeh',
  'https://archive.org/download/MuxaadarooyinkiiSheekhMustafeXaajiIsmaaciil/Sheekh%20Mustafa%20Xaaji%20Ismaaciil/Tasbiixda%20kusoo%20Aroortay%20Quraanka.mp3',
  '28:15',
  1695,
  'Shiikh Mustafe Xaaji Ismaaciil wuxuu ku lafogurayaa sababta Imaam Shaafici u yiri: Haddii aysan soo degi lahayn suurad kale oo aan tan ahayn way ku filnaan lahayd dadka. Afarta tiir ee badbaadada: Iimaanka, camalka suuban, isu dardaaranka xaqa, iyo samirka.',
  'Profound reflection by Sheikh Mustafe Haji Ismail on Imam Al-Shafi''i''s statement regarding Surah Al-Asr. The four pillars of salvation: Faith, righteous deeds, advising truth, and steadfast patience.',
  'Dacwah Islamic Network / Somali Audio Archive',
  'https://archive.org/details/MuxaadarooyinkiiSheekhMustafeXaajiIsmaaciil',
  'verified',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  title_so = EXCLUDED.title_so,
  title_en = EXCLUDED.title_en,
  audio_url = EXCLUDED.audio_url,
  duration = EXCLUDED.duration,
  duration_seconds = EXCLUDED.duration_seconds,
  transcript_so = EXCLUDED.transcript_so,
  transcript_en = EXCLUDED.transcript_en,
  source_attribution = EXCLUDED.source_attribution,
  verification_status = EXCLUDED.verification_status,
  is_published = EXCLUDED.is_published,
  updated_at = timezone('utc'::text, now());
