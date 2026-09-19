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
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'pending_payment', 'paid', 'processing', 'completed', 'cancelled')),
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

-- Note: Since this is an internal backend process with no authenticated frontend users, 
-- we leave RLS disabled for the orders table, or enable it and only use the Service Role key
-- for server-side insertions.

-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
