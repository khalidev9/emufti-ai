-- ==============================================================================
-- EMufti AI - Quran Subcis Alternating Recitation Sessions Migration
-- Migration: 20261019_quran_subcis_sessions.sql
-- Description: Stores completed Subcis sessions, user attempts, accuracy rates,
--              and evaluation logs with Row Level Security (RLS).
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: quran_subcis_sessions
CREATE TABLE IF NOT EXISTS public.quran_subcis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  surah_name TEXT NOT NULL,
  qari_id TEXT NOT NULL,
  qari_name TEXT NOT NULL,
  total_ayahs INT NOT NULL,
  user_ayahs_count INT NOT NULL,
  qari_ayahs_count INT NOT NULL,
  passed_count INT NOT NULL DEFAULT 0,
  mistakes_count INT NOT NULL DEFAULT 0,
  accuracy_percentage INT NOT NULL DEFAULT 100,
  mistakes_data JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_subcis_sessions_user ON public.quran_subcis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_subcis_sessions_surah ON public.quran_subcis_sessions(surah_number);
CREATE INDEX IF NOT EXISTS idx_subcis_sessions_date ON public.quran_subcis_sessions(completed_at);

-- -----------------------------------------------------------------------------
-- Enable Row Level Security (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.quran_subcis_sessions ENABLE ROW LEVEL SECURITY;

-- User-isolated RLS Policies
DROP POLICY IF EXISTS "Users can view their own subcis sessions" ON public.quran_subcis_sessions;
CREATE POLICY "Users can view their own subcis sessions"
  ON public.quran_subcis_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subcis sessions" ON public.quran_subcis_sessions;
CREATE POLICY "Users can insert their own subcis sessions"
  ON public.quran_subcis_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subcis sessions" ON public.quran_subcis_sessions;
CREATE POLICY "Users can update their own subcis sessions"
  ON public.quran_subcis_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own subcis sessions" ON public.quran_subcis_sessions;
CREATE POLICY "Users can delete their own subcis sessions"
  ON public.quran_subcis_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
