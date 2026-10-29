-- ==============================================================================
-- EMufti AI - Smart Tomorrow Lesson Planning for Macallin Qur'an Migration
-- Migration: 20261021_smart_macallin_tomorrow_lessons.sql
-- Description: Adds selection_mode, assigned_ayahs_count, accuracy_percentage,
--              next_lesson_assignment, teacher_override, and teacher_notes to
--              public.quran_macallin_lessons.
-- ==============================================================================

-- 1. Add Smart Planning Columns to public.quran_macallin_lessons
ALTER TABLE public.quran_macallin_lessons
  ADD COLUMN IF NOT EXISTS selection_mode TEXT DEFAULT 'ayah_range'
    CHECK (selection_mode IN ('entire_surah', 'ayah_range', 'custom_quantity')),
  ADD COLUMN IF NOT EXISTS assigned_ayahs_count INT DEFAULT 5
    CHECK (assigned_ayahs_count >= 1),
  ADD COLUMN IF NOT EXISTS accuracy_percentage NUMERIC(5,2) DEFAULT 100.00
    CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
  ADD COLUMN IF NOT EXISTS next_lesson_assignment JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS teacher_override BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS teacher_notes TEXT DEFAULT NULL;

-- 2. Indexes for fast retrieval by user, status and scheduled_date
CREATE INDEX IF NOT EXISTS idx_macallin_lessons_user_status_date
  ON public.quran_macallin_lessons(user_id, status, scheduled_date);

-- 3. RLS Policies Check
-- Ensure authenticated users can only view, insert, update and delete their own lessons
ALTER TABLE public.quran_macallin_lessons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'quran_macallin_lessons' AND policyname = 'Users can view their own macallin lessons'
  ) THEN
    CREATE POLICY "Users can view their own macallin lessons"
      ON public.quran_macallin_lessons FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'quran_macallin_lessons' AND policyname = 'Users can insert their own macallin lessons'
  ) THEN
    CREATE POLICY "Users can insert their own macallin lessons"
      ON public.quran_macallin_lessons FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'quran_macallin_lessons' AND policyname = 'Users can update their own macallin lessons'
  ) THEN
    CREATE POLICY "Users can update their own macallin lessons"
      ON public.quran_macallin_lessons FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
