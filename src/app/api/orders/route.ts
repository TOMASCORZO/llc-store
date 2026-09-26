import { parseContact } from '@/lib/contact';
import { tokenHash, validToken, TERMS_VERSION } from '@/lib/payments';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getFormationQuote } from '@/lib/formation';

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { entity, state, designator, ownership, sCorpEligible } = body;
  const contact = body.contact === undefined ? undefined : parseContact(body.contact);
  if (contact === null) return NextResponse.json({ error: 'Invalid contact details' }, { status: 400 });
  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
  const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim() : '';
  const llcName = typeof body.llcName === 'string' ? body.llcName.trim() : '';
  const phone = typeof body.customerPhone === 'string' ? body.customerPhone.trim() : '';
  const quote = getFormationQuote(state, entity);
  const suffixes = entity === 'LLC' ? ['LLC', 'L.L.C.'] : ['Inc.', 'Corporation'];
  if (!validToken(body.orderToken) || body.acceptTerms !== true || !quote || !customerName || customerName.length > 200 || !llcName || llcName.length > 200 ||
      customerEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) || phone.length > 40 ||
      !suffixes.includes(designator) || (entity === 'S-Corp' && sCorpEligible !== true) ||
      (entity === 'LLC' && !['single', 'multiple'].includes(ownership))) {
    return NextResponse.json({ error: 'Invalid formation details or eligibility' }, { status: 400 });
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Order service unavailable. Contact support@justmyllc.com.' }, { status: 503 });
  }
  const requestHash = tokenHash(JSON.stringify([customerName, customerEmail, phone, llcName, designator, entity, state, ownership, sCorpEligible, quote.total, ...(contact ? [contact] : [])]));
  try {
    const { data: order, error } = await supabaseAdmin.from('orders').insert({
      ...(contact ? { contact_details: contact } : {}),
      customer_name: customerName, customer_email: customerEmail, customer_phone: phone,
      llc_name: llcName, designator, entity_type: entity, formation_state: state,
      ownership: entity === 'LLC' ? ownership : null, s_corp_eligible: entity === 'S-Corp',
      amount_usd: quote.total, formation_fee_usd: quote.formationFee, service_fee_usd: quote.serviceFee,
      state_fee_usd: quote.stateFee, pricing_verified_at: quote.verifiedAt,
      request_hash: requestHash, access_token_hash: tokenHash(body.orderToken), terms_version: TERMS_VERSION, terms_accepted_at: new Date().toISOString(),
      status: 'pending_payment', locale: ['en', 'es', 'pt', 'fr', 'de', 'zh'].includes(body.locale) ? body.locale : 'en',
    }).select('id, status').single();
    if (error?.code === '23505') {
      const { data: existing } = await supabaseAdmin.from('orders').select('id, status, request_hash').eq('access_token_hash', tokenHash(body.orderToken)).single();
      if (existing && existing.request_hash !== requestHash) return NextResponse.json({ error: 'This attempt already saved different order details. Contact support before placing another order.' }, { status: 409 });
      if (existing) return NextResponse.json({ orderId: existing.id, status: existing.status }, { status: 200 });
    }
    if (error || !order) {
      return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
    }
    return NextResponse.json({ orderId: order.id, status: order.status, quote }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Order service unavailable' }, { status: 503 });
  }
}
