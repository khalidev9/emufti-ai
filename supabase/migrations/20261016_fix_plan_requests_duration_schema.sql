-- ==============================================================================
-- EMufti AI - Safe Schema Migration: Missing 'duration' and Plan Request Fields
-- Migration: 20261016_fix_plan_requests_duration_schema.sql
--
-- Fixes:
-- "Could not find the 'duration' column of 'plan_requests' in the schema cache"
--
-- Objectives:
-- 1. Safely & idempotently add the 'duration' column to public.plan_requests.
-- 2. Safely & idempotently add accompanying billing and activation columns
--    ('billing_interval', 'price_amount', 'currency', 'approved_at',
--     'approved_by', 'offer_expires_at', 'claimed_at', 'subscription_id').
-- 3. Backfill existing records with correct duration and pricing without
--    deleting, modifying, or breaking existing request records.
-- 4. Reload PostgREST schema cache to ensure immediate API availability.
-- ==============================================================================

-- -----------------------------------------------------------------------------
-- 1. Add Missing Columns to public.plan_requests (Idempotent)
-- -----------------------------------------------------------------------------
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '1 month';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS price_amount NUMERIC DEFAULT 5.99;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS offer_expires_at TIMESTAMPTZ;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 2. Backfill Existing Records with Authoritative Values
-- -----------------------------------------------------------------------------
-- Populate duration based on existing billing_interval if available, defaulting to '1 month'
UPDATE public.plan_requests
SET duration = CASE
  WHEN billing_interval = 'yearly' THEN '1 year'
  ELSE '1 month'
END
WHERE duration IS NULL;

-- Populate billing_interval based on duration if available, defaulting to 'monthly'
UPDATE public.plan_requests
SET billing_interval = CASE
  WHEN duration ILIKE '%year%' THEN 'yearly'
  ELSE 'monthly'
END
WHERE billing_interval IS NULL;

-- Backfill price_amount according to EMUFTI AI official pricing tiers:
-- Pro: $5.99/mo, $50.99/yr
-- Premium: $20.99/mo, $75.99/yr
UPDATE public.plan_requests
SET price_amount = CASE
  WHEN (coalesce(plan_slug, plan) = 'premium') AND (billing_interval = 'yearly' OR duration ILIKE '%year%') THEN 75.99
  WHEN (coalesce(plan_slug, plan) = 'premium') THEN 20.99
  WHEN (billing_interval = 'yearly' OR duration ILIKE '%year%') THEN 50.99
  ELSE 5.99
END
WHERE price_amount IS NULL;

-- Backfill default currency
UPDATE public.plan_requests
SET currency = 'USD'
WHERE currency IS NULL;

-- -----------------------------------------------------------------------------
-- 3. Add Safe Constraints & Indexes
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_plan_requests_billing_interval'
  ) THEN
    ALTER TABLE public.plan_requests
    ADD CONSTRAINT chk_plan_requests_billing_interval CHECK (billing_interval IN ('monthly', 'yearly'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_plan_requests_duration ON public.plan_requests (duration);
CREATE INDEX IF NOT EXISTS idx_plan_requests_billing_interval ON public.plan_requests (billing_interval);
CREATE INDEX IF NOT EXISTS idx_plan_requests_ref_status ON public.plan_requests (reference_id, status);

-- -----------------------------------------------------------------------------
-- 4. Ensure Permissions on Added Columns
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT ON TABLE public.plan_requests TO anon, authenticated;
GRANT ALL ON TABLE public.plan_requests TO postgres, service_role;

-- -----------------------------------------------------------------------------
-- 5. Signal PostgREST to Reload the Schema Cache
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
