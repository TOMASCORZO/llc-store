import { createHash } from 'node:crypto';
import Stripe from 'stripe';
import { parseBilling, type BillingDetails } from './billing';

export const TERMS_VERSION = '2026-09-30';
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export const validToken = (token: unknown): token is string => typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);
export function paymentsConfigured() {
  return !!(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.APP_URL && process.env.STRIPE_TAX_READY === 'true' && /^txcd_\d+$/.test(process.env.STRIPE_FORMATION_TAX_CODE || ''));
}
export function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe unavailable');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { maxNetworkRetries: 2, timeout: 20000 });
}
export function verifySignature(raw: string, signature: string | null, secret: string) {
  if (!signature) return false;
  try { Stripe.webhooks.constructEvent(raw, signature, secret); return true; } catch { return false; }
}
export type PaymentOrder = {
  id: string; amount_usd: number; customer_email: string; billing_details: BillingDetails;
  llc_name?: string; designator?: string; locale?: string;
  state_fee_usd?: number; domain_fee_usd?: number; domain_registration?: { name: string } | null;
  contact_details?: { webServiceFeeUsd?: number } | null;
};
function taxCode(name: string) {
  const value = process.env[name];
  if (!value || !/^txcd_\d+$/.test(value)) throw new Error(`Missing tax classification: ${name}`);
  return value;
}
export async function createPayment(order: PaymentOrder) {
  if (!paymentsConfigured()) throw new Error('Payments unavailable');
  const billing = parseBilling(order.billing_details);
  if (!billing) throw new Error('Billing details required');
  const total = Math.round(Number(order.amount_usd) * 100);
  if (!Number.isSafeInteger(total) || total <= 0) throw new Error('Invalid amount');
  const stateFee = Math.round(Number(order.state_fee_usd || 0) * 100);
  const domainFee = Math.round(Number(order.domain_fee_usd || 0) * 100);
  const webFee = Math.round(Number(order.contact_details?.webServiceFeeUsd || 0) * 100);
  const serviceFee = total - stateFee - domainFee - webFee;
  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const [name, cents, code] of [
    ['Company formation and selected services', serviceFee, 'STRIPE_FORMATION_TAX_CODE'],
    ['State filing fee', stateFee, 'STRIPE_STATE_FEE_TAX_CODE'],
    [`Domain registration: ${order.domain_registration?.name || ''}`, domainFee, 'STRIPE_DOMAIN_TAX_CODE'],
    ['Website service', webFee, 'STRIPE_WEBSITE_TAX_CODE'],
  ] as const) {
    if (!Number.isSafeInteger(cents) || cents < 0) throw new Error('Invalid price breakdown');
    if (cents) items.push({ quantity: 1, price_data: { currency: 'usd', unit_amount: cents, tax_behavior: 'exclusive', product_data: { name, tax_code: taxCode(code) } } });
  }
  const stripe = stripeClient();
  const customer = await stripe.customers.create({
    name: billing.name, email: order.customer_email,
    address: { line1: billing.address.street, line2: billing.address.addressLine2, city: billing.address.city, state: billing.address.region, postal_code: billing.address.postalCode, country: billing.address.country },
    metadata: { order_id: order.id },
  }, { idempotencyKey: `order:${order.id}:customer:v1` });
  const session = await stripe.checkout.sessions.create({
    mode: 'payment', ui_mode: 'embedded_page', redirect_on_completion: 'never', payment_method_types: ['card'], customer: customer.id,
    customer_update: { address: 'auto', name: 'auto' }, billing_address_collection: 'required',
    automatic_tax: { enabled: true }, line_items: items,
    client_reference_id: order.id, metadata: { order_id: order.id },
    payment_intent_data: { metadata: { order_id: order.id }, receipt_email: order.customer_email },
    locale: (['en','es','pt','fr','de','zh'].includes(order.locale || '') ? order.locale : 'auto') as Stripe.Checkout.SessionCreateParams.Locale,
  }, { idempotencyKey: `order:${order.id}:checkout:embedded:v1` });
  if (!session.id.startsWith('cs_') || !session.client_secret) throw new Error('Invalid payment session');
  return { id: session.id, clientSecret: session.client_secret };
}

export async function resumePayment(order: { id: string; checkout_id: string; amount_usd: number }) {
  const session = await stripeClient().checkout.sessions.retrieve(order.checkout_id);
  if (session.metadata?.order_id !== order.id || session.client_reference_id !== order.id || session.currency !== 'usd' ||
      session.amount_subtotal !== Math.round(Number(order.amount_usd) * 100) || session.ui_mode !== 'embedded_page') {
    throw new Error('Session does not match this embedded order');
  }
  if (session.status === 'complete') return { complete: true as const };
  if (session.status !== 'open' || !session.client_secret) throw new Error('Checkout is not available');
  return { clientSecret: session.client_secret };
}
