-- ==============================================================================
-- EMufti AI - 2,000-Question Quiz Pipeline, 15 Categories & Admin Schema
-- Migration: 20261019_quiz_2000_pipeline_and_admin.sql
-- ==============================================================================

-- 1. Expand quiz category constraints to encompass all 15 authentic Islamic knowledge topics
ALTER TABLE public.quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_category_check;
ALTER TABLE public.quiz_questions ADD CONSTRAINT quiz_questions_category_check
  CHECK (category IN (
    'quran',
    'tafsir',
    'hadith',
    'aqeedah',
    'fiqh',
    'purification_prayer',
    'fasting_ramadan',
    'zakat_charity',
    'hajj_umrah',
    'seerah',
    'history_companions',
    'history',
    'adhkar_duas_manners',
    'ethics_daily_life',
    'akhlaaq',
    'manners',
    'arabic_terminology',
    'general'
  ));

-- 2. Ensure difficulty levels include beginner, intermediate, advanced, and legacy aliases
ALTER TABLE public.quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_difficulty_check;
ALTER TABLE public.quiz_questions ADD CONSTRAINT quiz_questions_difficulty_check
  CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'easy', 'medium', 'hard'));

-- 3. Ensure review_status constraint supports complete editorial workflow
ALTER TABLE public.quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_review_status_check;
ALTER TABLE public.quiz_questions ADD CONSTRAINT quiz_questions_review_status_check
  CHECK (review_status IN ('verified', 'pending_review', 'rejected', 'reviewed', 'draft'));

-- 4. Ensure stable structured options, active flags, and timestamps exist
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS options JSONB,
  ADD COLUMN IF NOT EXISTS correct_option_id TEXT,
  ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'verified',
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 5. Indexes for fast retrieval by category, difficulty, and review status
CREATE INDEX IF NOT EXISTS idx_quiz_questions_15_cat ON public.quiz_questions (category, is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_review_status ON public.quiz_questions (review_status);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_qid ON public.quiz_questions (question_id);

-- 6. Cumulative User Quiz Progress Ledger
CREATE TABLE IF NOT EXISTS public.quiz_user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_quizzes_taken INT NOT NULL DEFAULT 0,
  total_questions_answered INT NOT NULL DEFAULT 0,
  total_correct INT NOT NULL DEFAULT 0,
  total_incorrect INT NOT NULL DEFAULT 0,
  highest_score INT NOT NULL DEFAULT 0,
  category_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.quiz_user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own quiz progress" ON public.quiz_user_progress;
CREATE POLICY "Users can read own quiz progress"
  ON public.quiz_user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own quiz progress" ON public.quiz_user_progress;
CREATE POLICY "Users can upsert own quiz progress"
  ON public.quiz_user_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Atomic RPC: Update Cumulative User Progress
CREATE OR REPLACE FUNCTION public.record_user_quiz_session(
  p_questions_answered INT,
  p_correct INT,
  p_incorrect INT,
  p_score INT,
  p_category TEXT DEFAULT 'general'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_prog RECORD;
  v_cat_data JSONB;
  v_cat_count INT := 0;
  v_cat_correct INT := 0;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Authentication required.');
  END IF;

  SELECT * INTO v_prog FROM public.quiz_user_progress WHERE user_id = v_uid FOR UPDATE;

  IF v_prog IS NULL THEN
    v_cat_data := jsonb_build_object(
      p_category, jsonb_build_object('answered', p_questions_answered, 'correct', p_correct)
    );
    INSERT INTO public.quiz_user_progress (
      user_id, total_quizzes_taken, total_questions_answered, total_correct, total_incorrect, highest_score, category_breakdown
    ) VALUES (
      v_uid, 1, p_questions_answered, p_correct, p_incorrect, p_score, v_cat_data
    );
  ELSE
    v_cat_data := COALESCE(v_prog.category_breakdown, '{}'::jsonb);
    IF v_cat_data ? p_category THEN
      v_cat_count := COALESCE((v_cat_data -> p_category ->> 'answered')::int, 0) + p_questions_answered;
      v_cat_correct := COALESCE((v_cat_data -> p_category ->> 'correct')::int, 0) + p_correct;
    ELSE
      v_cat_count := p_questions_answered;
      v_cat_correct := p_correct;
    END IF;
    v_cat_data := jsonb_set(
      v_cat_data,
      ARRAY[p_category],
      jsonb_build_object('answered', v_cat_count, 'correct', v_cat_correct)
    );

    UPDATE public.quiz_user_progress
    SET
      total_quizzes_taken = total_quizzes_taken + 1,
      total_questions_answered = total_questions_answered + p_questions_answered,
      total_correct = total_correct + p_correct,
      total_incorrect = total_incorrect + p_incorrect,
      highest_score = GREATEST(highest_score, p_score),
      category_breakdown = v_cat_data,
      updated_at = timezone('utc'::text, now())
    WHERE user_id = v_uid;
  END IF;

  RETURN jsonb_build_object('success', TRUE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_user_quiz_session(INT, INT, INT, INT, TEXT) TO authenticated, service_role;

-- 8. Admin RPC: Batch Question Validation and Import
CREATE OR REPLACE FUNCTION public.admin_import_quiz_questions(
  p_questions JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_q JSONB;
  v_count INT := 0;
  v_skipped INT := 0;
  v_errors JSONB := '[]'::jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.';
  END IF;

  FOR v_q IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    BEGIN
      -- Validate required fields
      IF (v_q ->> 'question_id') IS NULL OR (v_q ->> 'question_en') IS NULL OR (v_q ->> 'correct_option_id') IS NULL THEN
        v_errors := v_errors || jsonb_build_object('id', v_q ->> 'question_id', 'error', 'Missing required fields');
        v_skipped := v_skipped + 1;
        CONTINUE;
      END IF;

      INSERT INTO public.quiz_questions (
        question_id,
        category,
        difficulty,
        question_en,
        question_so,
        question_ar,
        options,
        correct_option_id,
        explanation_en,
        explanation_so,
        explanation_ar,
        source_citation,
        review_status,
        is_verified,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        v_q ->> 'question_id',
        COALESCE(v_q ->> 'category', 'general'),
        COALESCE(v_q ->> 'difficulty', 'intermediate'),
        v_q ->> 'question_en',
        COALESCE(v_q ->> 'question_so', v_q ->> 'question_en'),
        COALESCE(v_q ->> 'question_ar', ''),
        COALESCE(v_q -> 'options', '[]'::jsonb),
        v_q ->> 'correct_option_id',
        v_q ->> 'explanation_en',
        v_q ->> 'explanation_so',
        v_q ->> 'explanation_ar',
        COALESCE(v_q ->> 'source_citation', 'Verified Islamic Source'),
        COALESCE(v_q ->> 'review_status', 'verified'),
        TRUE,
        TRUE,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
      )
      ON CONFLICT (question_id) DO UPDATE SET
        category = EXCLUDED.category,
        difficulty = EXCLUDED.difficulty,
        question_en = EXCLUDED.question_en,
        question_so = EXCLUDED.question_so,
        question_ar = EXCLUDED.question_ar,
        options = EXCLUDED.options,
        correct_option_id = EXCLUDED.correct_option_id,
        explanation_en = EXCLUDED.explanation_en,
        explanation_so = EXCLUDED.explanation_so,
        explanation_ar = EXCLUDED.explanation_ar,
        source_citation = EXCLUDED.source_citation,
        review_status = EXCLUDED.review_status,
        is_verified = EXCLUDED.is_verified,
        is_active = EXCLUDED.is_active,
        updated_at = timezone('utc'::text, now());

      v_count := v_count + 1;
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors || jsonb_build_object('id', v_q ->> 'question_id', 'error', SQLERRM);
      v_skipped := v_skipped + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', TRUE,
    'imported_count', v_count,
    'skipped_count', v_skipped,
    'errors', v_errors
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_import_quiz_questions(JSONB) TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
