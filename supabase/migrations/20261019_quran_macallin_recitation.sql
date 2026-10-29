-- ==============================================================================
-- EMufti AI - Quran Macallin (Recitation Teacher) Migration
-- Migration: 20261019_quran_macallin_recitation.sql
-- Description: Supports Tarteel-inspired Quran recitation practice, daily lesson
--              scheduling (Casharka Berri), evaluation logs, and progress history.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Table: quran_macallin_lessons
-- Stores scheduled daily lessons, passages, due dates, and completion status.
CREATE TABLE IF NOT EXISTS public.quran_macallin_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  surah_name TEXT NOT NULL,
  surah_arabic_name TEXT,
  start_ayah INT NOT NULL CHECK (start_ayah >= 1),
  end_ayah INT NOT NULL CHECK (end_ayah >= start_ayah),
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'needs_review')),
  mistakes_count INT NOT NULL DEFAULT 0 CHECK (mistakes_count >= 0),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_scheduled_date_lesson UNIQUE (user_id, scheduled_date)
);

CREATE INDEX IF NOT EXISTS idx_macallin_lessons_user ON public.quran_macallin_lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_macallin_lessons_user_date ON public.quran_macallin_lessons(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_macallin_lessons_status ON public.quran_macallin_lessons(status);

-- 2. Table: quran_macallin_attempts
-- Stores individual recitation attempts and evaluation results for specific verses.
CREATE TABLE IF NOT EXISTS public.quran_macallin_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.quran_macallin_lessons(id) ON DELETE CASCADE,
  surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  ayah_number INT NOT NULL CHECK (ayah_number >= 1),
  transcript TEXT,
  expected_text TEXT,
  accuracy_status TEXT NOT NULL CHECK (accuracy_status IN ('passed', 'errors_detected', 'unverified')),
  mistakes JSONB DEFAULT '[]'::jsonb,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_macallin_attempts_user ON public.quran_macallin_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_macallin_attempts_lesson ON public.quran_macallin_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_macallin_attempts_user_surah ON public.quran_macallin_attempts(user_id, surah_number, ayah_number);

-- -----------------------------------------------------------------------------
-- Enable Row Level Security (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.quran_macallin_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_macallin_attempts ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- User-isolated RLS Policies for quran_macallin_lessons
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own macallin lessons" ON public.quran_macallin_lessons;
CREATE POLICY "Users can view their own macallin lessons"
  ON public.quran_macallin_lessons
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own macallin lessons" ON public.quran_macallin_lessons;
CREATE POLICY "Users can insert their own macallin lessons"
  ON public.quran_macallin_lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own macallin lessons" ON public.quran_macallin_lessons;
CREATE POLICY "Users can update their own macallin lessons"
  ON public.quran_macallin_lessons
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own macallin lessons" ON public.quran_macallin_lessons;
CREATE POLICY "Users can delete their own macallin lessons"
  ON public.quran_macallin_lessons
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- User-isolated RLS Policies for quran_macallin_attempts
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own macallin attempts" ON public.quran_macallin_attempts;
CREATE POLICY "Users can view their own macallin attempts"
  ON public.quran_macallin_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own macallin attempts" ON public.quran_macallin_attempts;
CREATE POLICY "Users can insert their own macallin attempts"
  ON public.quran_macallin_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
