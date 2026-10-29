-- =============================================================================
-- Migration: 20261015_quran_hifdh_planner.sql
-- Description: Quran Completion Schedule Planner and Progress Finder tables
-- =============================================================================

-- 1. Table: quran_reading_plans
CREATE TABLE IF NOT EXISTS public.quran_reading_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'pages_per_day' CHECK (plan_type IN ('pages_per_day', 'target_days')),
  mushaf_total_pages INT NOT NULL DEFAULT 604 CHECK (mushaf_total_pages > 0),
  mushaf_edition TEXT NOT NULL DEFAULT 'Madinah Mushaf (604 pages)',
  daily_target_pages NUMERIC(5, 2) NOT NULL DEFAULT 20.0 CHECK (daily_target_pages > 0),
  target_days INT NOT NULL DEFAULT 31 CHECK (target_days > 0),
  current_page INT NOT NULL DEFAULT 0 CHECK (current_page >= 0),
  pages_read INT NOT NULL DEFAULT 0 CHECK (pages_read >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  estimated_end_date DATE,
  last_read_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_quran_plan UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_quran_plans_user ON public.quran_reading_plans(user_id);

-- 2. Table: quran_planner_logs
CREATE TABLE IF NOT EXISTS public.quran_planner_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.quran_reading_plans(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pages_completed INT NOT NULL DEFAULT 0 CHECK (pages_completed >= 0),
  start_page INT,
  end_page INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_daily_plan_log UNIQUE (user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_quran_planner_logs_user_date ON public.quran_planner_logs(user_id, log_date);

-- 3. Update quran_reading_progress to include page and juz columns if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quran_reading_progress' 
    AND column_name = 'last_page'
  ) THEN
    ALTER TABLE public.quran_reading_progress ADD COLUMN last_page INT DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quran_reading_progress' 
    AND column_name = 'last_juz'
  ) THEN
    ALTER TABLE public.quran_reading_progress ADD COLUMN last_juz INT DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quran_reading_progress' 
    AND column_name = 'last_hizb'
  ) THEN
    ALTER TABLE public.quran_reading_progress ADD COLUMN last_hizb INT DEFAULT 1;
  END IF;
END $$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.quran_reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_planner_logs ENABLE ROW LEVEL SECURITY;

-- 5. User-isolated RLS Policies for quran_reading_plans
DROP POLICY IF EXISTS "Users can view their own quran plans" ON public.quran_reading_plans;
CREATE POLICY "Users can view their own quran plans"
  ON public.quran_reading_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own quran plans" ON public.quran_reading_plans;
CREATE POLICY "Users can insert their own quran plans"
  ON public.quran_reading_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own quran plans" ON public.quran_reading_plans;
CREATE POLICY "Users can update their own quran plans"
  ON public.quran_reading_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own quran plans" ON public.quran_reading_plans;
CREATE POLICY "Users can delete their own quran plans"
  ON public.quran_reading_plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. User-isolated RLS Policies for quran_planner_logs
DROP POLICY IF EXISTS "Users can view their own planner logs" ON public.quran_planner_logs;
CREATE POLICY "Users can view their own planner logs"
  ON public.quran_planner_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own planner logs" ON public.quran_planner_logs;
CREATE POLICY "Users can insert their own planner logs"
  ON public.quran_planner_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own planner logs" ON public.quran_planner_logs;
CREATE POLICY "Users can update their own planner logs"
  ON public.quran_planner_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own planner logs" ON public.quran_planner_logs;
CREATE POLICY "Users can delete their own planner logs"
  ON public.quran_planner_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
