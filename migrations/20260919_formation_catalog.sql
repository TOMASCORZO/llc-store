-- Apply once to an existing orders table before enabling formation requests.
-- Existing orders retain their original amounts and statuses.
BEGIN;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending_review', 'pending_payment', 'paid', 'processing', 'completed', 'cancelled'));
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending_review';
ALTER TABLE orders ALTER COLUMN amount_usd DROP DEFAULT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS entity_type TEXT CHECK (entity_type IN ('LLC', 'S-Corp'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS formation_state TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ownership TEXT CHECK (ownership IN ('single', 'multiple'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS s_corp_eligible BOOLEAN;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS formation_fee_usd NUMERIC(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_fee_usd NUMERIC(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS state_fee_usd NUMERIC(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pricing_verified_at DATE;
COMMIT;
