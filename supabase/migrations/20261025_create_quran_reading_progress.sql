-- =============================================================================
-- EMUFTI AI: Create Missing Quran Reading Progress Table
-- Migration: 20261025_create_quran_reading_progress.sql
-- 
-- Fixes:
-- 1. Creates public.quran_reading_progress table to resolve PostgREST 404 Not Found (PGRST205)
-- 2. Includes all required columns: id, user_id, surah_number, verse_number, page_number, updated_at
-- 3. Provides backwards-compatible columns: last_surah, last_verse, last_page, last_juz, last_hizb, surah_name
-- 4. Establishes unique constraint on user_id for conflict-free upserts
-- 5. Enables Row Level Security (RLS) and attaches user-isolated policies
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Create public.quran_reading_progress Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quran_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INT NOT NULL DEFAULT 1 CHECK (surah_number BETWEEN 1 AND 114),
  verse_number INT NOT NULL DEFAULT 1 CHECK (verse_number >= 1),
  page_number INT NOT NULL DEFAULT 1 CHECK (page_number BETWEEN 1 AND 604),
  -- Backwards-compatible legacy column mirrors
  last_surah INT NOT NULL DEFAULT 1 CHECK (last_surah BETWEEN 1 AND 114),
  last_verse INT NOT NULL DEFAULT 1 CHECK (last_verse >= 1),
  last_page INT NOT NULL DEFAULT 1 CHECK (last_page BETWEEN 1 AND 604),
  last_juz INT NOT NULL DEFAULT 1 CHECK (last_juz BETWEEN 1 AND 30),
  last_hizb INT NOT NULL DEFAULT 1 CHECK (last_hizb BETWEEN 1 AND 60),
  surah_name TEXT DEFAULT 'Al-Fatihah',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_reading_progress UNIQUE (user_id)
);

-- Indexes for high performance reads
CREATE INDEX IF NOT EXISTS idx_quran_reading_progress_user ON public.quran_reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_reading_progress_updated ON public.quran_reading_progress(updated_at DESC);

-- -----------------------------------------------------------------------------
-- 2. Row Level Security (RLS) & Policies
-- -----------------------------------------------------------------------------
ALTER TABLE public.quran_reading_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reading progress" ON public.quran_reading_progress;
CREATE POLICY "Users can view own reading progress"
  ON public.quran_reading_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reading progress" ON public.quran_reading_progress;
CREATE POLICY "Users can insert own reading progress"
  ON public.quran_reading_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reading progress" ON public.quran_reading_progress;
CREATE POLICY "Users can update own reading progress"
  ON public.quran_reading_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reading progress" ON public.quran_reading_progress;
CREATE POLICY "Users can delete own reading progress"
  ON public.quran_reading_progress FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own reading progress" ON public.quran_reading_progress;
CREATE POLICY "Users can manage own reading progress"
  ON public.quran_reading_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. Grants & Permissions
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quran_reading_progress TO authenticated;
GRANT ALL ON TABLE public.quran_reading_progress TO service_role;
