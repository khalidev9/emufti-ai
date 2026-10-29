-- =============================================================================
-- EMUFTI AI — QUIZ QUALITY, RANDOMIZATION & STABLE OPTION ID SCHEMA
-- Enhances public.quiz_questions with stable option IDs, review status,
-- and enriched categories (tafsir, akhlaaq) and difficulties (beginner, intermediate, advanced)
-- =============================================================================

-- 1. Relax or update category constraint to include all 8 core Islamic sciences
ALTER TABLE public.quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_category_check;
ALTER TABLE public.quiz_questions ADD CONSTRAINT quiz_questions_category_check
  CHECK (category IN ('quran', 'tafsir', 'hadith', 'seerah', 'fiqh', 'aqeedah', 'history', 'akhlaaq', 'manners', 'general'));

-- 2. Relax or update difficulty constraint to support beginner, intermediate, advanced
ALTER TABLE public.quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_difficulty_check;
ALTER TABLE public.quiz_questions ADD CONSTRAINT quiz_questions_difficulty_check
  CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'easy', 'medium', 'hard'));

-- 3. Add stable option IDs and review status fields
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS options JSONB,
  ADD COLUMN IF NOT EXISTS correct_option_id TEXT,
  ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'verified' CHECK (review_status IN ('verified', 'reviewed', 'draft')),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_quiz_questions_active ON public.quiz_questions (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_quiz_questions_diff_cat ON public.quiz_questions (category, difficulty, is_active);

-- 4. Enhance quiz_answers to record stable option ID as well as index
ALTER TABLE public.quiz_answers
  ADD COLUMN IF NOT EXISTS selected_option_id TEXT;

-- 5. RPC to fetch randomized quiz questions securely
CREATE OR REPLACE FUNCTION public.get_randomized_quiz_questions(
  p_category TEXT DEFAULT 'all',
  p_difficulty TEXT DEFAULT 'all',
  p_limit INT DEFAULT 10
)
RETURNS SETOF public.quiz_questions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT *
  FROM public.quiz_questions
  WHERE is_active = TRUE
    AND (p_category = 'all' OR category = p_category)
    AND (
      p_difficulty = 'all' OR
      difficulty = p_difficulty OR
      (p_difficulty = 'beginner' AND difficulty = 'easy') OR
      (p_difficulty = 'intermediate' AND difficulty = 'medium') OR
      (p_difficulty = 'advanced' AND difficulty = 'hard')
    )
  ORDER BY random()
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_randomized_quiz_questions(TEXT, TEXT, INT) TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
