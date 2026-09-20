# Direct ordering and payment setup

## Flow

1. Customer selects a listed formation, provides contact/company details and accepts the policies.
2. `POST /api/orders` validates eligibility and calculates the USD amount from the server catalog. It saves a `pending_payment` order with the terms version and acceptance time. There is no manual inquiry or quote approval.
3. The same browser tab keeps a random 256-bit access token in session storage. Only its SHA-256 hash is stored in the database. This token authorizes the status and payment endpoints; an order UUID alone grants no access.
4. `/api/orders/payment` creates a hosted Creem checkout with a server-calculated `custom_price` in cents. It uses a single one-time USD product for all state/entity combinations. The provider handles card data and applicable transaction taxes.
5. `/api/webhook` verifies HMAC over the raw body, checkout ID, product, paid status, USD and the base amount before changing `pending_payment` to `paid`. Repeated deliveries cannot restart fulfillment or reverse later statuses. Browser return parameters never establish payment.
6. Staff use the private Supabase orders table to find paid orders, contact the customer for remaining ownership details/documents and filing authorization, and then coordinate filing. EIN and bank application assistance are performed by Just My LLC. This change does not automate a purchase from a formation vendor.

## Database

Production inspection on 2026-09-20 found a project URL but **empty** `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, database password and Postgres connection strings. No live order was inserted and no remote migration could be applied.

- Set `NEXT_PUBLIC_SUPABASE_URL` and a nonempty `SUPABASE_SERVICE_ROLE_KEY` in Vercel. Keep the service key server-only.
- New database: run `supabase-schema.sql` in the Supabase SQL editor.
- Existing database: run `migrations/20260919_formation_catalog.sql`, then `migrations/20260920_direct_checkout.sql`.
- The new migration enables RLS and revokes access from public roles. Server routes use the service-role credential.
- Historical `pending_review` records are retained, not converted into authorized purchases. New orders always start `pending_payment`.

## Creem configuration

Confirm the merchant account is eligible for the actual assisted formation service before enabling collection. Create a **one-time USD** product with the accurate service description; disable customer-entered discounts so the paid amount matches the saved order. The `custom_price` API parameter sets each order's base amount; never create a subscription for the $50 service fee.

Add these server-only environment variables in Vercel with `vercel env add NAME production` (use preview environments for testing):

- `CREEM_API_KEY`
- `CREEM_PRODUCT_ID`
- `CREEM_WEBHOOK_SECRET`
- `CREEM_TEST_MODE`: `true` for sandbox, `false` for live
- `APP_URL`: canonical URL, e.g. `https://www.justmyllc.com`

Register `https://www.justmyllc.com/api/webhook` for `checkout.completed`. Use the matching sandbox or live signing secret. Deploy again after changing variables. The webhook must be publicly reachable without a deployment login.

Until configuration is complete, saved orders remain unpaid and checkout displays an unavailable message. No payment is simulated. Missing database credentials return 503 without claiming to save an order.

## Operational verification before live collection

- Complete a sandbox purchase, verify the amount and state fee, confirm the matching Supabase record becomes `paid`, and confirm the browser reflects it.
- Retry the same order, decline/cancel a payment, repeat the signed webhook and tamper with an unsigned return URL. There must be no duplicate checkout or false paid status.
- Verify receipt delivery in Creem and inbound/outbound support. Resend outbound setup alone does not prove inbound support works.
- A provider timeout or failure to persist a session locks that order's checkout attempt to avoid double payment. Search Creem by the order UUID (`request_id`) and reconcile its session before clearing `checkout_started_at`; never blindly clear the lock. Existing stored sessions are reused. Expired sessions require support reconciliation before replacement.
- Status polling runs for about a minute. Refresh later if the webhook is delayed. Lost session storage requires support to verify customer identity and recover the order; the public endpoint intentionally does not look up orders by email alone.
- After `paid`, staff collect required information and filing authorization, then set `processing` and eventually `completed`. Never file an unpaid order. Do not assume a paid order has complete formation information.
- Process refunds through the payment provider, record the resolution privately and reconcile the order manually. Automatic refund/dispute handling and a staff admin UI are outside this implementation. Monitor the provider dashboard for disputes and refunds before fulfillment.

API references: [Create checkout](https://docs.creem.io/api-reference/endpoint/create-checkout), [webhook signatures and events](https://docs.creem.io/code/webhooks).
