ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS plan_id TEXT NOT NULL DEFAULT 'standard' CHECK (plan_id IN ('basic', 'standard', 'premium'));
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS premium_package BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS premium_package_fee_usd NUMERIC(10,2) NOT NULL DEFAULT 0;
