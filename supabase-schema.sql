-- LLC Store Schema Definition

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    llc_name TEXT NOT NULL,
    designator TEXT DEFAULT 'LLC',
    status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_review', 'pending_payment', 'paid', 'processing', 'completed', 'cancelled')),
    amount_usd NUMERIC(10, 2) NOT NULL,
    entity_type TEXT CHECK (entity_type IN ('LLC', 'S-Corp')),
    formation_state TEXT,
    ownership TEXT CHECK (ownership IN ('single', 'multiple')),
    s_corp_eligible BOOLEAN,
    formation_fee_usd NUMERIC(10, 2),
    service_fee_usd NUMERIC(10, 2),
    state_fee_usd NUMERIC(10, 2),
    pricing_verified_at DATE,
    cream_payment_id TEXT,
    locale TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- trigger for updating the 'updated_at' column
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_order_modtime 
BEFORE UPDATE ON orders 
FOR EACH ROW 
EXECUTE FUNCTION update_modified_column();

-- Run after 20260919_formation_catalog.sql. Existing review requests remain historical.
BEGIN;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending_payment';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS request_hash TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS access_token_hash TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS terms_version TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_started_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_id TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- All order access is server-side with the service-role key. No public policies.
REVOKE ALL ON orders FROM anon, authenticated;
COMMIT;
