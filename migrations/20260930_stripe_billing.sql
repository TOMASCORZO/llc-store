BEGIN;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_details JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_provider TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_total_cents BIGINT CHECK (payment_total_cents >= 0);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_tax_cents BIGINT CHECK (payment_tax_cents >= 0);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_fee_cents BIGINT CHECK (payment_fee_cents >= 0);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_billing_details JSONB;
-- Historical orders remain untouched. Never reuse a session from another processor.
COMMIT;
