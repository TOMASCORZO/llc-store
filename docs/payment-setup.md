# Stripe Checkout setup

The application uses Stripe Embedded Checkout in USD. Billing name/address are editable at the end of the order review, with shortcuts to reuse contact/company details. The server validates and stores billing details, creates a Stripe Customer, and sends its ID to Checkout. The card form mounts inside Just My LLC after the customer saves the order. `ui_mode=embedded_page` and `redirect_on_completion=never` prevent a hosted Checkout redirect. Stripe.js collects card data in its secure embedded form; the app never receives card numbers or CVC. The customer can confirm/correct billing in Stripe.

## Configuration when the account is available

Account country supplied by the owner: United States; business state: New Mexico. No account, API keys or live payment verification existed when this integration was prepared.

Set these **server-only** environment variables in the deployment settings:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: sandbox publishable key first, from the same Stripe account/mode as the secret key. Set before building/deploying (Next.js embeds it in the browser bundle).
- `STRIPE_SECRET_KEY`: sandbox secret first, then the live secret after testing.
- `STRIPE_WEBHOOK_SECRET`: signing secret for `/api/webhook` in the same environment.
- `APP_URL`: `https://www.justmyllc.com` in production; `http://localhost:3000` locally.
- `STRIPE_TAX_READY=true`: set only after configuring the business origin, appropriate tax registrations, and product tax classifications in Stripe Tax.
- `STRIPE_FORMATION_TAX_CODE`: verified Stripe tax code for formation and selected administrative services.
- `STRIPE_STATE_FEE_TAX_CODE`: verified treatment of passed-through state filing fees.
- `STRIPE_DOMAIN_TAX_CODE`: required for orders including a domain.
- `STRIPE_WEBSITE_TAX_CODE`: required for orders including the website service.

Tax codes must be real `txcd_...` identifiers reviewed for the actual services. No exemption, registration or tax rate is assumed from the LLC's state. If items bundled into the formation services need different tax treatment, split those items and assign their codes before enabling collection. Automatic tax uses exclusive prices: applicable taxes are added to the subtotal and shown to the customer before payment. Stripe only collects in configured jurisdictions. Stripe Tax does not establish registrations or automatically satisfy filing/remittance obligations.

The embedded integration requires the publishable key above but no manually created Stripe Price/Product IDs. Configure receipts and business branding in the Stripe Dashboard. Do not enter real credentials into committed files.

## Card processing fees — still pending

No card surcharge is currently charged (`payment_fee_cents=0`). The requested recovery of Stripe processing fees is **not enabled**. Stripe processing costs vary; a blanket 2.9% + $0.30 assumption is not implemented. A US credit-card surcharge needs applicable network/state eligibility, required notices, caps, and reliable credit/debit/prepaid detection. Embedded Checkout in this implementation does not make those determinations before pricing. Do not enable a flat extra line item for every card or relabel a card surcharge to bypass these restrictions.

When the Stripe account exists, confirm the account's permitted surcharge solution, actual costs, and customer/card eligibility with Stripe. Implement and test it before charging customers. If a supported integration requires a different payment UI, adapt the payment flow then. Taxes on Stripe's own fees are business expenses and are distinct from transaction taxes added to the customer's order.

## Database and provider migration

Keep `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` configured. The service-role key stays server-only. Set `RUN_DB_MIGRATIONS=1` only in the deployment environment that manages migrations; the existing runner uses `POSTGRES_URL_NON_POOLING` or `POSTGRES_URL`. `20260930_stripe_billing.sql` adds billing, provider identity and separate final payment/tax/fee amounts. `amount_usd` continues to be the order subtotal.

Historical orders and payment sessions remain unchanged. The payment endpoint refuses historical/foreign sessions instead of redirecting customers to the removed processor. Reconcile such orders with support before migrating them. Remove the old provider's API key, product ID, webhook secret and test-mode variables from deployment settings, and disable its webhook in its dashboard if one was registered. This code change does not delete external accounts or rewrite payment history.

## Verification and fulfillment

1. Configure a Stripe sandbox and Tax test settings/codes. Register `/api/webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded` (snapshot events).
2. Run `npm test`, `npm run lint`, and `npm run build`. Test billing reuse/editing and required field validation on desktop and mobile.
3. Complete sandbox Checkout with Stripe test cards. Verify the displayed exclusive tax and total, saved `payment_total_cents` / `payment_tax_cents`, and the effective billing details from Stripe. Test a declined card, a 3-D Secure test card, payment form load failure, refresh/resume, and delayed webhook arrival. The onComplete callback opens only the internal order confirmation and never marks the order paid.
4. Deliver a tampered signature, unpaid session, incorrect session/currency/subtotal/total and a duplicate event. Only matching signed paid events may mark the order paid. Browser redirect parameters are never evidence of payment.
5. Domain fulfillment runs only after the verified payment; its existing claim/idempotency rules remain in place.
6. Verify receipts, production domain and live/test separation before enabling live payments. No real Stripe transaction has yet been tested without the account.

The browser keeps a 256-bit order token in session storage; only its SHA-256 hash is saved. Payment/status endpoints require it. Checkout creation uses both a database claim and Stripe idempotency keys to avoid duplicate payable sessions. An ambiguous provider timeout or persistence failure deliberately leaves the claim locked. Reconcile the order metadata and session in Stripe before clearing `checkout_started_at`; never clear blindly. Expired sessions also require reconciliation before replacement. Stored embedded sessions are retrieved through the authenticated payment endpoint and reused. Their client secrets are returned only to the order-token holder with Cache-Control: no-store; secrets are kept only in browser memory and are not persisted in the database or URLs. Historical hosted sessions are rejected instead of creating a second payable session; reconcile/expire those sessions before migrating a pending order.

## References

- [Checkout Sessions API](https://docs.stripe.com/api/checkout/sessions/create)
- [Stripe Tax in Checkout](https://docs.stripe.com/tax/checkout)
- [Webhook signatures](https://docs.stripe.com/webhooks/signature)
- [Surcharge considerations](https://stripe.com/resources/more/surcharge-fees)
