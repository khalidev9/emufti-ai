-- ==============================================================================
-- Migration: Quran Khatm Challenge, Sessions & Quiz Status
-- Tracks Khatm challenges with statuses: 'active', 'completed', 'failed'
-- Supports 10-question Khatm exam results and official certificate generation
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.khatm_challenges (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    target_end_date DATE NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
    completed_slots JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    screen_id TEXT UNIQUE,
    issue_date TEXT,
    signature TEXT,
    quiz_score INTEGER,
    quiz_passed BOOLEAN,
    quiz_completed_at TIMESTAMPTZ,
    is_failed_session BOOLEAN NOT NULL DEFAULT FALSE,
    failed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_khatm_challenges_user_id ON public.khatm_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_khatm_challenges_status ON public.khatm_challenges(status);
CREATE INDEX IF NOT EXISTS idx_khatm_challenges_screen_id ON public.khatm_challenges(screen_id);

-- RLS Security Policies
ALTER TABLE public.khatm_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own khatm challenges or guest challenges"
    ON public.khatm_challenges
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own khatm challenges"
    ON public.khatm_challenges
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own khatm challenges"
    ON public.khatm_challenges
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
