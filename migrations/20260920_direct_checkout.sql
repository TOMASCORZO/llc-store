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
