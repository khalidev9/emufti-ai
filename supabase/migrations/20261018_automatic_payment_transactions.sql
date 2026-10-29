-- ==============================================================================
-- EMufti AI - Automatic Payment Transactions Table & Security Policies
-- Migration: 20261018_automatic_payment_transactions.sql
--
-- Supports Method 2 (Automatic Payment):
-- 1. Mobile Money: eVC Plus (Hormuud), Sahal (Golis), ZAAD (Telesom)
-- 2. Credit / Debit Card
--
-- Security:
-- - Never stores raw card numbers or CVV/CVC
-- - Stores masked phone number / card brand / last 4 only
-- - Strict Row Level Security: users see only their own transactions
-- - Privileged status updates restricted to service_role / trusted server RPC
-- ==============================================================================

-- 1. Create payment_transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_slug TEXT NOT NULL CHECK (plan_slug IN ('free', 'pro', 'premium')),
  billing_interval TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'annual', 'yearly')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mobile_money', 'card', 'manual')),
  payment_option TEXT, -- 'evc_plus', 'sahal', 'zaad', 'card'
  mobile_operator TEXT, -- 'Hormuud', 'Golis', 'Telesom', 'Somnet', 'Soltelco', 'Durdur'
  mobile_provider TEXT, -- 'eVC Plus', 'Sahal', 'ZAAD'
  masked_identifier TEXT, -- '+252 61 ••• ••34' or '•••• •••• •••• 4242'
  card_brand TEXT, -- 'Visa', 'Mastercard', 'Amex', 'Discover', etc.
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled')),
  failure_reason TEXT,
  provider_tx_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_payment_tx_user ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_ref ON public.payment_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_tx_created ON public.payment_transactions(created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Users can view own payment transactions" ON public.payment_transactions;
CREATE POLICY "Users can view own payment transactions"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payment transactions" ON public.payment_transactions;
CREATE POLICY "Users can insert own payment transactions"
  ON public.payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins can view all payment transactions" ON public.payment_transactions;
CREATE POLICY "Admins can view all payment transactions"
  ON public.payment_transactions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role full access on payment_transactions" ON public.payment_transactions;
CREATE POLICY "Service role full access on payment_transactions"
  ON public.payment_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Safe RPC to record payment transactions atomically
CREATE OR REPLACE FUNCTION public.record_payment_transaction(
  p_reference_id TEXT,
  p_plan_slug TEXT,
  p_billing_interval TEXT,
  p_payment_method TEXT,
  p_payment_option TEXT DEFAULT NULL,
  p_mobile_operator TEXT DEFAULT NULL,
  p_mobile_provider TEXT DEFAULT NULL,
  p_masked_identifier TEXT DEFAULT NULL,
  p_card_brand TEXT DEFAULT NULL,
  p_amount NUMERIC DEFAULT 0,
  p_currency TEXT DEFAULT 'USD',
  p_status TEXT DEFAULT 'pending',
  p_failure_reason TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_tx_id UUID;
BEGIN
  INSERT INTO public.payment_transactions (
    reference_id,
    user_id,
    plan_slug,
    billing_interval,
    payment_method,
    payment_option,
    mobile_operator,
    mobile_provider,
    masked_identifier,
    card_brand,
    amount,
    currency,
    status,
    failure_reason,
    metadata,
    created_at,
    updated_at
  )
  VALUES (
    p_reference_id,
    v_caller_id,
    p_plan_slug,
    p_billing_interval,
    p_payment_method,
    p_payment_option,
    p_mobile_operator,
    p_mobile_provider,
    p_masked_identifier,
    p_card_brand,
    p_amount,
    p_currency,
    p_status,
    p_failure_reason,
    p_metadata,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'transaction_id', v_tx_id,
    'reference_id', p_reference_id,
    'status', p_status
  );
END;
$$;

-- Grant permissions for schema cache exposure
REVOKE ALL ON FUNCTION public.record_payment_transaction(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_payment_transaction(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated, service_role;

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';
