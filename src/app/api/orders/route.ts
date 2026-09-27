import { parseDomainRegistration, DOMAIN_PRICE_USD } from '@/lib/domains';
import { checkDomain } from '@/lib/openprovider';
import { parseRegisteredAgent } from '@/lib/registered-agent';
import { parseMembers } from '@/lib/members';
import { parseBusinessMail } from '@/lib/business-mail';
import { parseContact } from '@/lib/contact';
import { tokenHash, validToken, TERMS_VERSION } from '@/lib/payments';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getFormationQuote, isPlanId, includesEin, einServiceFee, PREMIUM_PACKAGE_USD } from '@/lib/formation';

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { entity, state, designator, ownership, sCorpEligible } = body;
  const businessMail = body.businessMail === undefined ? undefined : parseBusinessMail(body.businessMail);
  if (businessMail === null || (businessMail && !body.contact)) return NextResponse.json({ error: 'Invalid business mail details' }, { status: 400 });
  const contact = body.contact === undefined ? undefined : parseContact(body.contact);
  if (contact === null) return NextResponse.json({ error: 'Invalid contact details' }, { status: 400 });
  const members = body.members === undefined ? undefined : parseMembers(body.members, businessMail, entity);
  if (members === null || (members && (!contact || (entity === 'LLC' && ownership !== (members.length === 1 ? 'single' : 'multiple'))))) return NextResponse.json({ error: 'Invalid owner details' }, { status: 400 });
  const registeredAgent = body.registeredAgent === undefined ? undefined : parseRegisteredAgent(body.registeredAgent, state);
  if (registeredAgent === null || (registeredAgent && !contact)) return NextResponse.json({ error: 'Invalid registered agent' }, { status: 400 });
  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
  const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim() : '';
  const llcName = typeof body.llcName === 'string' ? body.llcName.trim() : '';
  const phone = typeof body.customerPhone === 'string' ? body.customerPhone.trim() : '';
  const orderUpdatesConsent = body.orderUpdatesConsent === true;
  if ((body.orderUpdatesConsent !== undefined && typeof body.orderUpdatesConsent !== 'boolean') || (orderUpdatesConsent && (!phone || !contact))) {
    return NextResponse.json({ error: 'Invalid order updates consent or missing phone' }, { status: 400 });
  }
  const plan = body.plan === undefined ? 'standard' : body.plan;
  if (!isPlanId(plan) || (body.premiumPackage !== undefined && typeof body.premiumPackage !== 'boolean')) return NextResponse.json({ error: 'Invalid plan or package' }, { status: 400 });
  if (body.einRequested !== undefined && (typeof body.einRequested !== 'boolean' || !contact)) return NextResponse.json({ error: 'Invalid EIN selection' }, { status: 400 });
  const premiumPackage = body.premiumPackage === true;
  const einFee = einServiceFee(plan, premiumPackage, body.einRequested === true);
  const ein = { requested: includesEin(plan) || premiumPackage || body.einRequested === true, feeUsd: einFee };
  const quote = getFormationQuote(state, entity, plan);
  const domain = body.domainRegistration == null ? null : parseDomainRegistration(body.domainRegistration);
  if (body.domainRegistration != null && (!domain || !contact || !contact.postalCode)) return NextResponse.json({ error: 'Invalid domain contact' }, { status: 400 });
  if (domain) {
    try { const result = await checkDomain(domain.name); if (!result.available || result.premium) return NextResponse.json({ error: 'Domain is not available at this price' }, { status: 409 }); }
    catch { return NextResponse.json({ error: 'Domain availability could not be confirmed' }, { status: 503 }); }
  }
  const total = quote ? quote.total + (premiumPackage ? PREMIUM_PACKAGE_USD : 0) + einFee + (domain ? DOMAIN_PRICE_USD : 0) : 0;
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
  const requestHash = tokenHash(JSON.stringify([customerName, customerEmail, phone, llcName, designator, entity, state, ownership, sCorpEligible, total, ...(domain ? [domain] : []), ...(body.einRequested !== undefined ? [ein] : []), ...(body.plan !== undefined ? [plan] : []), ...(body.premiumPackage !== undefined ? [premiumPackage] : []), ...(contact ? [contact] : []), ...(businessMail ? [businessMail] : []), ...(members ? [members] : []), ...(registeredAgent ? [registeredAgent] : []), ...(body.orderUpdatesConsent !== undefined ? [orderUpdatesConsent] : [])]));
  try {
    const { data: order, error } = await supabaseAdmin.from('orders').insert({
      ...(contact ? { contact_details: { ...contact, ...(body.einRequested !== undefined ? { ein } : {}), ...(registeredAgent ? { registeredAgent } : {}), ...(members ? { members } : {}), ...(businessMail ? { businessMail } : {}), ...(body.orderUpdatesConsent !== undefined ? { orderUpdatesConsent, orderUpdatesConsentAt: orderUpdatesConsent ? new Date().toISOString() : null, orderUpdatesConsentVersion: '2026-09-26' } : {}) } } : {}),
      ...(domain ? {domain_registration: domain, domain_fee_usd: DOMAIN_PRICE_USD, domain_status: 'pending_payment'} : {}),
      customer_name: customerName, customer_email: customerEmail, customer_phone: phone,
      llc_name: llcName, designator, entity_type: entity, formation_state: state,
      ownership: entity === 'LLC' ? ownership : null, s_corp_eligible: entity === 'S-Corp',
      plan_id: plan, premium_package: premiumPackage, premium_package_fee_usd: premiumPackage ? PREMIUM_PACKAGE_USD : 0,
      amount_usd: total, formation_fee_usd: quote.formationFee, service_fee_usd: quote.serviceFee,
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
    return NextResponse.json({ orderId: order.id, status: order.status, quote: { ...quote, einFee, premiumPackageFee: premiumPackage ? PREMIUM_PACKAGE_USD : 0, total } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Order service unavailable' }, { status: 503 });
  }
}
