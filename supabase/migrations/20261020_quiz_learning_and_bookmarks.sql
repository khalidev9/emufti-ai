-- ==============================================================================
-- EMufti AI - Islamic Quiz Learning Dashboard, Bookmarks, Mistakes & Streaks
-- Migration: 20261020_quiz_learning_and_bookmarks.sql
-- ==============================================================================

-- 1. Quiz Bookmarks (Allows saving questions for later revision)
CREATE TABLE IF NOT EXISTS public.quiz_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_bookmarks_user ON public.quiz_bookmarks(user_id);

ALTER TABLE public.quiz_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own bookmarks" ON public.quiz_bookmarks;
CREATE POLICY "Users can read own bookmarks"
  ON public.quiz_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.quiz_bookmarks;
CREATE POLICY "Users can insert own bookmarks"
  ON public.quiz_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.quiz_bookmarks;
CREATE POLICY "Users can delete own bookmarks"
  ON public.quiz_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Quiz User Mistakes (Tracks questions answered incorrectly for focused review)
CREATE TABLE IF NOT EXISTS public.quiz_user_mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  selected_option_id TEXT,
  correct_option_id TEXT NOT NULL,
  times_incorrect INT NOT NULL DEFAULT 1,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  last_attempted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_mistakes_user ON public.quiz_user_mistakes(user_id, is_resolved);

ALTER TABLE public.quiz_user_mistakes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own mistakes" ON public.quiz_user_mistakes;
CREATE POLICY "Users can read own mistakes"
  ON public.quiz_user_mistakes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own mistakes" ON public.quiz_user_mistakes;
CREATE POLICY "Users can upsert own mistakes"
  ON public.quiz_user_mistakes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Quiz Daily Streaks (Real study streak tracking without fabricated data)
CREATE TABLE IF NOT EXISTS public.quiz_daily_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 1,
  longest_streak INT NOT NULL DEFAULT 1,
  last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_active_days INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.quiz_daily_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own streaks" ON public.quiz_daily_streaks;
CREATE POLICY "Users can read own streaks"
  ON public.quiz_daily_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own streaks" ON public.quiz_daily_streaks;
CREATE POLICY "Users can update own streaks"
  ON public.quiz_daily_streaks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Atomic RPC: Record Daily Study Activity & Compute Real Streak
CREATE OR REPLACE FUNCTION public.record_quiz_daily_activity(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_streak RECORD;
  v_curr INT := 1;
  v_long INT := 1;
  v_days INT := 1;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User ID required');
  END IF;

  SELECT * INTO v_streak FROM public.quiz_daily_streaks WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.quiz_daily_streaks (
      user_id, current_streak, longest_streak, last_activity_date, total_active_days
    ) VALUES (
      p_user_id, 1, 1, v_today, 1
    );
    RETURN jsonb_build_object(
      'current_streak', 1,
      'longest_streak', 1,
      'last_activity_date', v_today,
      'total_active_days', 1
    );
  END IF;

  -- If activity was already recorded today, keep current streak
  IF v_streak.last_activity_date = v_today THEN
    RETURN jsonb_build_object(
      'current_streak', v_streak.current_streak,
      'longest_streak', v_streak.longest_streak,
      'last_activity_date', v_streak.last_activity_date,
      'total_active_days', v_streak.total_active_days
    );
  END IF;

  -- If activity was yesterday, streak continues!
  IF v_streak.last_activity_date = (v_today - INTERVAL '1 day')::DATE THEN
    v_curr := v_streak.current_streak + 1;
    v_long := GREATEST(v_streak.longest_streak, v_curr);
    v_days := v_streak.total_active_days + 1;
  ELSE
    -- Streak reset
    v_curr := 1;
    v_long := v_streak.longest_streak;
    v_days := v_streak.total_active_days + 1;
  END IF;

  UPDATE public.quiz_daily_streaks
  SET current_streak = v_curr,
      longest_streak = v_long,
      last_activity_date = v_today,
      total_active_days = v_days,
      updated_at = timezone('utc'::text, now())
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'current_streak', v_curr,
    'longest_streak', v_long,
    'last_activity_date', v_today,
    'total_active_days', v_days
  );
END;
$$;
