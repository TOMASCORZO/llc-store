import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const TERMS_VERSION = '2026-09-20';
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export const validToken = (token: unknown): token is string => typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);
export function paymentsConfigured() {
  return !!(process.env.CREEM_API_KEY && process.env.CREEM_PRODUCT_ID && process.env.CREEM_WEBHOOK_SECRET && process.env.APP_URL);
}
export function verifySignature(raw: string, signature: string | null, secret: string) {
  if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  return timingSafeEqual(Buffer.from(signature, 'hex'), createHmac('sha256', secret).update(raw).digest());
}
export async function createPayment(order: { id: string; amount_usd: number; customer_email: string }) {
  if (!paymentsConfigured()) throw new Error('Payments unavailable');
  const response = await fetch(`${process.env.CREEM_TEST_MODE === 'true' ? 'https://test-api.creem.io' : 'https://api.creem.io'}/v1/checkouts`, {
    method: 'POST', headers: { 'x-api-key': process.env.CREEM_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ request_id: order.id, product_id: process.env.CREEM_PRODUCT_ID,
      custom_price: Math.round(Number(order.amount_usd) * 100), units: 1,
      customer: { email: order.customer_email }, metadata: { order_id: order.id },
      success_url: `${process.env.APP_URL!.replace(/\/$/, '')}/checkout/confirmation?order=${order.id}` }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('Payment session creation failed');
  const session = await response.json();
  const url = new URL(session.checkout_url);
  if (typeof session.id !== 'string' || url.protocol !== 'https:' || !(url.hostname === 'creem.io' || url.hostname.endsWith('.creem.io'))) throw new Error('Invalid payment session');
  return { id: session.id as string, url: url.href };
}
