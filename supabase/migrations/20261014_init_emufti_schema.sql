-- ==============================================================================
-- EMufti AI - Production Supabase Database Schema & Row Level Security Policies
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Seeker of Knowledge',
  avatar_url TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'so', 'ar')),
  default_response_language TEXT NOT NULL DEFAULT 'auto' CHECK (default_response_language IN ('auto', 'en', 'so', 'ar')),
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Auto create profile on auth signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, preferred_language)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Islamic Inquiry',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  topic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations"
  ON public.conversations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.conversations(user_id, updated_at DESC);

-- 3. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  arabic_text TEXT,
  language TEXT DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('sent', 'generating', 'completed', 'failed')),
  feedback TEXT CHECK (feedback IN ('helpful', 'unhelpful')),
  citations JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own messages"
  ON public.messages FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);

-- 4. PLANS TABLE
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE CHECK (slug IN ('free', 'pro', 'premium')),
  description TEXT NOT NULL,
  price_amount INTEGER NOT NULL DEFAULT 0, -- in cents: 0 = Free, 999 = $9.99
  currency TEXT NOT NULL DEFAULT 'usd',
  billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
  message_limit INTEGER NOT NULL DEFAULT 15, -- daily message quota
  max_tokens INTEGER NOT NULL DEFAULT 1500,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Plans are publicly readable by all authenticated and anonymous users
CREATE POLICY "Public plans are viewable by everyone"
  ON public.plans FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage plans"
  ON public.plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Seed Plans
INSERT INTO public.plans (slug, name, description, price_amount, currency, billing_interval, message_limit, max_tokens, features)
VALUES
  (
    'free',
    'Free Seeker',
    'Essential Islamic Q&A for daily learning and worship inquiries.',
    0,
    'usd',
    'month',
    15,
    1500,
    '["15 questions per day", "Access to Somali, Arabic & English", "Quran & Hadith basic citations", "Conversation history", "Standard response speed"]'::jsonb
  ),
  (
    'pro',
    'Talib al-Ilm (Pro)',
    'Higher capacity, detailed scholarly comparative fiqh analysis, and export tools.',
    999,
    'usd',
    'month',
    150,
    4000,
    '["150 questions per day", "Scholarly ikhtilaf (four madhhabs comparison)", "Deep hadith authenticity analysis", "Full conversation export (JSON/Markdown)", "Priority server response speed", "Custom answer length preferences"]'::jsonb
  ),
  (
    'premium',
    'Alim Research (Premium)',
    'Unrestricted scholarly inquiries, extended context memory, and research citations.',
    2499,
    'usd',
    'month',
    1000,
    8000,
    '["Highest message allowance (1,000/day)", "Extended context window memory", "Advanced Tafsir & Asbab al-Nuzul explorer", "Priority access during peak hours", "Dedicated Islamic research tools", "Direct scholarly citation cross-referencing"]'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- 5. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  provider TEXT NOT NULL DEFAULT 'development' CHECK (provider IN ('stripe', 'development', 'manual')),
  provider_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '30 days'),
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and manage all subscriptions"
  ON public.subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

-- 6. USAGE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  request_id TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON public.usage_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage"
  ON public.usage_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_usage_user_day ON public.usage_records(user_id, created_at DESC);

-- 7. SAVED ITEMS (KNOWLEDGE BASE)
CREATE TABLE IF NOT EXISTS public.saved_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved items"
  ON public.saved_items FOR ALL
  USING (auth.uid() = user_id);

-- 8. RESPONSE FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.response_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('helpful', 'unhelpful')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.response_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit feedback"
  ON public.response_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
  ON public.response_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
  ON public.response_feedback FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 9. REPORTS TABLE (Religious Inaccuracy / Flagging)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('inaccurate_quran', 'unverified_hadith', 'inappropriate_fiqh', 'misleading_translation', 'other')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reports"
  ON public.reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 10. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'plan', 'report', 'system', 'model')),
  target_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read and insert audit logs"
  ON public.admin_audit_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Server-side usage counting helper function
CREATE OR REPLACE FUNCTION public.check_daily_usage(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_plan_limit INTEGER := 15;
  v_today_count INTEGER := 0;
  v_plan_slug TEXT := 'free';
BEGIN
  -- Get user active plan
  SELECT p.message_limit, p.slug INTO v_plan_limit, v_plan_slug
  FROM public.subscriptions s
  JOIN public.plans p ON s.plan_id = p.id
  WHERE s.user_id = p_user_id AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;

  -- Default to free plan if no subscription
  IF v_plan_limit IS NULL THEN
    v_plan_limit := 15;
    v_plan_slug := 'free';
  END IF;

  -- Count records in last 24 hours
  SELECT COUNT(*) INTO v_today_count
  FROM public.usage_records
  WHERE user_id = p_user_id
    AND created_at >= (now() - INTERVAL '24 hours')
    AND status = 'success';

  RETURN jsonb_build_object(
    'allowed', (v_today_count < v_plan_limit),
    'used_today', v_today_count,
    'daily_limit', v_plan_limit,
    'plan_slug', v_plan_slug,
    'remaining', GREATEST(0, v_plan_limit - v_today_count)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
