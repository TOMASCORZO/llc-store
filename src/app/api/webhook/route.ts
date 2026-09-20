import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySignature } from '@/lib/payments';

export async function POST(request: Request) {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Payments unavailable' }, { status: 503 });
  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get('creem-signature'), secret)) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  let event;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid event' }, { status: 400 }); }
  if (event?.eventType !== 'checkout.completed') return NextResponse.json({ received: true });
  const session = event.object;
  const payment = session?.order;
  if (!session?.metadata?.order_id || !payment?.id) return NextResponse.json({ error: 'Missing order' }, { status: 400 });
  const { data: order, error } = await supabaseAdmin.from('orders').select('id,status,checkout_id,amount_usd,payment_id').eq('id', session.metadata.order_id).single();
  if (error || !order) return NextResponse.json({ error: 'Order unavailable' }, { status: 503 });
  if (!order.checkout_id) return NextResponse.json({ error: 'Checkout not yet stored; retry' }, { status: 503 });
  if (session.id !== order.checkout_id || session.status !== 'completed' || payment.status !== 'paid' ||
      payment.currency?.toUpperCase() !== 'USD' || payment.amount !== Math.round(Number(order.amount_usd) * 100) ||
      payment.product !== process.env.CREEM_PRODUCT_ID) return NextResponse.json({ error: 'Payment mismatch' }, { status: 400 });
  if (order.payment_id === payment.id) return NextResponse.json({ received: true });
  if (order.status !== 'pending_payment') return NextResponse.json({ error: 'Order state conflict' }, { status: 409 });
  const { error: updateError } = await supabaseAdmin.from('orders').update({ status: 'paid', payment_id: payment.id, paid_at: new Date().toISOString() }).eq('id', order.id).eq('status', 'pending_payment');
  if (updateError) return NextResponse.json({ error: 'Unable to record payment' }, { status: 503 });
  return NextResponse.json({ received: true });
}
