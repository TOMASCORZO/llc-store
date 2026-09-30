import { registerPaidDomain } from '@/lib/register-domain';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySignature } from '@/lib/payments';

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Payments unavailable' }, { status: 503 });
  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get('stripe-signature'), secret)) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  let event;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid event' }, { status: 400 }); }
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event?.type)) return NextResponse.json({ received: true });
  const session = event.data?.object;
  if (!session?.metadata?.order_id || typeof session.payment_intent !== 'string') return NextResponse.json({ error: 'Missing order or payment' }, { status: 400 });
  const { data: order, error } = await supabaseAdmin.from('orders').select('id,status,checkout_id,amount_usd,payment_id,domain_status,payment_provider').eq('id', session.metadata.order_id).single();
  if (error || !order) return NextResponse.json({ error: 'Order unavailable' }, { status: 503 });
  if (!order.checkout_id) return NextResponse.json({ error: 'Checkout not yet stored; retry' }, { status: 503 });
  const subtotal = Math.round(Number(order.amount_usd) * 100);
  const tax = session.total_details?.amount_tax;
  if (order.payment_provider !== 'stripe' || session.id !== order.checkout_id || session.client_reference_id !== order.id ||
      session.mode !== 'payment' || session.status !== 'complete' || session.payment_status !== 'paid' || session.currency !== 'usd' ||
      event.livemode !== process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') ||
      session.amount_subtotal !== subtotal || !Number.isSafeInteger(tax) || tax < 0 ||
      session.amount_total !== subtotal + tax || session.total_details?.amount_discount !== 0 || session.total_details?.amount_shipping !== 0 ||
      session.automatic_tax?.enabled !== true || session.automatic_tax?.status !== 'complete') {
    return NextResponse.json({ error: 'Payment mismatch' }, { status: 400 });
  }
  if (order.payment_id === session.payment_intent) {
    if (order.domain_status === 'pending_payment') { try { await registerPaidDomain(order.id); } catch { return NextResponse.json({ error: 'Domain processing unavailable' }, { status: 503 }); } }
    return NextResponse.json({ received: true });
  }
  if (order.status !== 'pending_payment') return NextResponse.json({ error: 'Order state conflict' }, { status: 409 });
  const { error: updateError } = await supabaseAdmin.from('orders').update({
    status: 'paid', payment_id: session.payment_intent, paid_at: new Date().toISOString(),
    payment_total_cents: session.amount_total, payment_tax_cents: tax, payment_fee_cents: 0,
    payment_billing_details: session.customer_details || null,
  }).eq('id', order.id).eq('status', 'pending_payment');
  if (updateError) return NextResponse.json({ error: 'Unable to record payment' }, { status: 503 });
  if (order.domain_status === 'pending_payment') { try { await registerPaidDomain(order.id); } catch { return NextResponse.json({ error: 'Domain processing unavailable' }, { status: 503 }); } }
  return NextResponse.json({ received: true });
}
