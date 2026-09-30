import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createPayment, isStripeCheckoutUrl, paymentsConfigured, tokenHash, validToken } from '@/lib/payments';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!validToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!paymentsConfigured()) return NextResponse.json({ error: 'Payments are not available yet. Your order remains unpaid.' }, { status: 503 });
  const { data: order, error } = await supabaseAdmin.from('orders').select('id,status,amount_usd,customer_email,checkout_url,checkout_id,payment_provider,billing_details,llc_name,designator,locale,state_fee_usd,domain_fee_usd,domain_registration,contact_details').eq('access_token_hash', tokenHash(token)).single();
  if (error || !order) return NextResponse.json({ error: 'Order unavailable' }, { status: 404 });
  if (order.status !== 'pending_payment') return NextResponse.json({ error: 'Order is not awaiting payment' }, { status: 409 });
  if (order.payment_provider !== 'stripe' || !order.billing_details) return NextResponse.json({ error: 'This order requires billing migration. Contact support.' }, { status: 409 });
  if (order.checkout_url) {
    if (!order.checkout_id?.startsWith('cs_') || !isStripeCheckoutUrl(order.checkout_url)) return NextResponse.json({ error: 'Unsupported checkout. Contact support.' }, { status: 409 });
    return NextResponse.json({ url: order.checkout_url });
  }
  // Claim once: an ambiguous provider timeout must not create a second payable session.
  const { data: claimed, error: claimError } = await supabaseAdmin.from('orders').update({ checkout_started_at: new Date().toISOString() }).eq('id', order.id).is('checkout_started_at', null).eq('status', 'pending_payment').select('id').maybeSingle();
  if (claimError || !claimed) return NextResponse.json({ error: 'Payment session is being prepared. Contact support if this persists.' }, { status: 409 });
  try {
    const session = await createPayment(order);
    const { error: saveError } = await supabaseAdmin.from('orders').update({ checkout_id: session.id, checkout_url: session.url }).eq('id', order.id);
    if (saveError) throw new Error('Unable to store session');
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: 'Payment session could not be confirmed. Contact support with your order reference before trying again.' }, { status: 502 });
  }
}
