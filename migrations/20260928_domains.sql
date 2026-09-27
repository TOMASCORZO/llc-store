ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS domain_registration JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS domain_fee_usd NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS domain_status TEXT CHECK (domain_status IN ('pending_payment','registering','registered','requested','needs_review'));
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS domain_provider_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS domain_customer_handle TEXT;
