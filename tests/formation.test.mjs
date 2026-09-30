import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';
import Stripe from 'stripe';
const prices = JSON.parse(fs.readFileSync('src/lib/formation-prices.json', 'utf8'));
function load(path, imports, env = {}, globals = {}) {
  const context = { exports: {}, require: name => imports[name], process: { env }, Intl, Buffer, URL, AbortSignal, ...globals };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText, context);
  return context.exports;
}
const domainModule = load('src/lib/domains.ts', {});
const domainProvider = {checkDomain: async name => ({name,available:true,premium:false,price:17.98})};
const contactModule = load('src/lib/contact.ts', {});
const businessMailModule = load('src/lib/business-mail.ts', { './contact': contactModule });
const membersModule = load('src/lib/members.ts', { './contact': contactModule });
const agentModule = load('src/lib/registered-agent.ts', { './business-mail': businessMailModule });
const billingModule = load('src/lib/billing.ts', { './contact': contactModule });
const payments = load('src/lib/payments.ts', { 'node:crypto': crypto, stripe: Stripe, './billing': billingModule });
const catalog = load('src/lib/formation.ts', { './formation-prices.json': prices });
import { NextResponse } from 'next/server.js';
const env = { NEXT_PUBLIC_SUPABASE_URL: 'test', SUPABASE_SERVICE_ROLE_KEY: 'test' };
function api(config = env) {
  let inserted;
  const supabaseAdmin = { from: () => ({ insert: data => {
    inserted = data;
    return { select: () => ({ single: async () => ({ data: { id: 'test-order', status: data.status } }) }) };
  } }) };
  const route = load('src/app/api/orders/route.ts', { 'next/server': { NextResponse }, '@/lib/domains': domainModule, '@/lib/openprovider': domainProvider, '@/lib/register-domain': {registerPaidDomain: async () => {}}, '@/lib/billing': billingModule, '@/lib/contact': contactModule, '@/lib/business-mail': businessMailModule, '@/lib/members': membersModule, '@/lib/registered-agent': agentModule, '@/lib/payments': payments, '@/lib/formation': catalog, '@/lib/supabase': { supabaseAdmin } }, config);
  return { post: body => route.POST(new Request('http://localhost/api/orders', { method: 'POST', body: JSON.stringify(body) })), inserted: () => inserted };
}
const billingDetails = { name: 'Test User', address: { country: 'US', street: '123 Example Street', addressLine2: '', city: 'Albuquerque', region: 'NM', postalCode: '87101' } };
const valid = { billing: billingDetails, orderToken: 'a'.repeat(64), acceptTerms: true, customerName: 'Test User', customerEmail: 'test@example.com', llcName: 'Test Company', entity: 'LLC', state: 'New Mexico', designator: 'LLC', ownership: 'single', locale: 'es' };

test('101 available formations: every total adds exactly $50 to base formation and state fee', () => {
  assert.equal(prices.length, 102);
  assert.equal(new Set(prices.map(p => `${p.entity}:${p.state}`)).size, 102);
  assert.equal(catalog.getStates('LLC').length, 51);
  assert.equal(catalog.getStates('S-Corp').length, 50);
  for (const row of prices) {
    const quote = catalog.getFormationQuote(row.state, row.entity);
    if (!row.allowed) { assert.equal(quote, undefined); continue; }
    assert.equal(quote.formationFee, 0);
    assert.equal(quote.total, row.stateFee + 50);
  }
  assert.equal(catalog.getFormationQuote('New Mexico', 'LLC').total, 102);
  assert.equal(catalog.getFormationQuote('Florida', 'S-Corp').total, 120);
  assert.equal(catalog.getFormationQuote('Louisiana', 'S-Corp'), undefined);
  assert.equal(catalog.getFormationQuote('Invalid', 'LLC'), undefined);
});
test('server ignores client amounts and stores its own itemized quote', async () => {
  const route = api();
  const response = await route.post({ ...valid, amount_usd: 1, stateFee: 0, serviceFee: 0 });
  assert.equal(response.status, 201);
  assert.equal(route.inserted().amount_usd, 102);
  assert.equal(route.inserted().service_fee_usd, 50);
  assert.equal(route.inserted().state_fee_usd, 52);
  assert.equal(route.inserted().status, 'pending_payment');
  assert.equal(route.inserted().locale, 'es');
});
test('rejects unavailable state/entity, wrong suffix, missing ownership and S Corp eligibility', async () => {
  for (const change of [ { acceptTerms: false }, { orderToken: 'short' }, { state: 'invalid' }, { entity: 'C-Corp' }, { designator: 'Inc.' }, { ownership: null }, { customerName: ' ' }, { customerEmail: 'invalid' }, { entity: 'S-Corp', designator: 'Inc.', sCorpEligible: false }, { entity: 'S-Corp', designator: 'Inc.', state: 'Louisiana', sCorpEligible: true } ]) {
    const route = api();
    assert.equal((await route.post({ ...valid, ...change })).status, 400);
    assert.equal(route.inserted(), undefined);
  }
});
test('eligible S Corp request uses its own state fee', async () => {
  const route = api();
  assert.equal((await route.post({ ...valid, entity: 'S-Corp', designator: 'Inc.', sCorpEligible: true, state: 'Florida' })).status, 201);
  assert.equal(route.inserted().amount_usd, 120);
  assert.equal(route.inserted().ownership, null);
});
test('missing database credentials never returns a fake saved request', async () => {
  const route = api({});
  assert.equal((await route.post(valid)).status, 503);
  assert.equal(route.inserted(), undefined);
});

const sign = (raw, timestamp = Math.floor(Date.now() / 1000)) => Stripe.webhooks.generateTestHeaderString({ payload: raw, secret: 'secret', timestamp });
test('Stripe signature rejects tampering, wrong secrets, missing headers and old replays', () => {
  const raw = JSON.stringify({ type: 'checkout.session.completed' });
  const signature = sign(raw);
  assert.equal(payments.verifySignature(raw, signature, 'secret'), true);
  assert.equal(payments.verifySignature(raw + ' ', signature, 'secret'), false);
  assert.equal(payments.verifySignature(raw, signature, 'wrong'), false);
  assert.equal(payments.verifySignature(raw, null, 'secret'), false);
  assert.equal(payments.verifySignature(raw, 'invalid', 'secret'), false);
  assert.equal(payments.verifySignature(raw, sign(raw, Math.floor(Date.now() / 1000) - 600), 'secret'), false);
});
test('Stripe webhook matches session, subtotal and tax; replay never repeats payment', async () => {
  const config = { STRIPE_WEBHOOK_SECRET: 'secret', STRIPE_SECRET_KEY: 'sk_test_example' };
  const stored = { id: 'order_test', payment_provider: 'stripe', status: 'pending_payment', checkout_id: 'cs_test', amount_usd: 102, payment_id: null };
  let updates = 0;
  const db = { from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: stored }) }) }),
    update: values => ({ eq: () => ({ eq: async () => { Object.assign(stored, values); updates++; return {}; } }) }),
  }) };
  const route = load('src/app/api/webhook/route.ts', { 'next/server': { NextResponse }, '@/lib/register-domain': { registerPaidDomain: async () => {} }, '@/lib/payments': payments, '@/lib/supabase': { supabaseAdmin: db } }, config);
  const session = { id: 'cs_test', mode: 'payment', status: 'complete', payment_status: 'paid', client_reference_id: 'order_test', metadata: { order_id: 'order_test' }, payment_intent: 'pi_test', currency: 'usd', amount_subtotal: 10200, amount_total: 10965, total_details: { amount_tax: 765, amount_discount: 0, amount_shipping: 0 }, automatic_tax: { enabled: true, status: 'complete' } };
  const event = { type: 'checkout.session.completed', livemode: false, data: { object: session } };
  async function post(body, signed = true) {
    const raw = JSON.stringify(body);
    return route.POST(new Request('http://localhost/api/webhook', { method: 'POST', body: raw, headers: signed ? { 'stripe-signature': sign(raw) } : {} }));
  }
  assert.equal((await post(event, false)).status, 401);
  for (const change of [{ amount_subtotal: 1 }, { currency: 'eur' }, { payment_status: 'unpaid' }, { id: 'cs_other' }, { client_reference_id: 'other' }, { amount_total: 10200 }, { total_details: { amount_tax: -1 } }, { automatic_tax: { enabled: true, status: 'failed' } }]) {
    assert.equal((await post({ ...event, data: { object: { ...session, ...change } } })).status, 400);
  }
  assert.equal((await post({ ...event, livemode: true })).status, 400);
  assert.equal(updates, 0);
  assert.equal((await post(event)).status, 200);
  assert.equal(stored.status, 'paid');
  assert.equal(stored.payment_total_cents, 10965);
  assert.equal(stored.payment_tax_cents, 765);
  assert.equal((await post(event)).status, 200);
  assert.equal(updates, 1);
});

test('payment retries reuse a stored session and concurrent attempts cannot create a second one', async () => {
  let starts = 0;
  const stored = { payment_provider: 'stripe', billing_details: billingDetails, id: 'order', status: 'pending_payment', amount_usd: 102, customer_email: 'test@example.com', checkout_url: null };
  let claimed = false;
  const db = { from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: { ...stored } }) }) }),
    update: values => ({ eq: () => {
      if (values.checkout_id) { Object.assign(stored, values); return Promise.resolve({}); }
      return { is: () => ({ eq: () => ({ select: () => ({ maybeSingle: async () => {
        if (claimed) return { data: null };
        claimed = true;
        return { data: { id: stored.id } };
      } }) }) }) };
    } }),
  }) };
  const route = load('src/app/api/orders/payment/route.ts', { 'next/server': { NextResponse }, '@/lib/domains': domainModule, '@/lib/openprovider': domainProvider, '@/lib/register-domain': {registerPaidDomain: async () => {}}, '@/lib/supabase': { supabaseAdmin: db }, '@/lib/payments': { ...payments, paymentsConfigured: () => true, resumePayment: async () => ({ clientSecret: 'cs_test_secret_test' }), createPayment: async () => { starts++; return { id: 'cs_test', clientSecret: 'cs_test_secret_test' }; } } });
  const request = () => new Request('http://localhost/api/orders/payment', { method: 'POST', headers: { Authorization: `Bearer ${'a'.repeat(64)}` } });
  const results = await Promise.all([route.POST(request()), route.POST(request())]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  assert.equal(starts, 1);
  assert.equal((await route.POST(request())).status, 200);
  assert.equal(starts, 1);
  const resumed = await route.POST(request());
  assert.equal(resumed.headers.get('cache-control'), 'no-store');
  assert.equal((await resumed.json()).clientSecret, 'cs_test_secret_test');
  assert.equal(stored.checkout_url, null);
  stored.payment_provider = null;
  assert.equal((await route.POST(request())).status, 409);
  stored.payment_provider = 'stripe';
  stored.status = 'paid';
  assert.equal((await route.POST(request())).status, 409);
});
test('payment endpoint fails closed without configuration or access token', async () => {
  const route = load('src/app/api/orders/payment/route.ts', { 'next/server': { NextResponse }, '@/lib/domains': domainModule, '@/lib/openprovider': domainProvider, '@/lib/register-domain': {registerPaidDomain: async () => {}}, '@/lib/supabase': {}, '@/lib/billing': billingModule, '@/lib/contact': contactModule, '@/lib/business-mail': businessMailModule, '@/lib/members': membersModule, '@/lib/registered-agent': agentModule, '@/lib/payments': payments });
  assert.equal((await route.POST(new Request('http://localhost', { method: 'POST' }))).status, 401);
  assert.equal((await route.POST(new Request('http://localhost', { method: 'POST', headers: { Authorization: `Bearer ${'a'.repeat(64)}` } }))).status, 503);
});


test('order retry returns the original reference and rejects changed details', async () => {
  let stored;
  const db = { from: () => ({
    insert: values => ({ select: () => ({ single: async () => {
      if (stored) return { error: { code: '23505' } };
      stored = { ...values, id: 'saved_order' };
      return { data: stored };
    } }) }),
    select: () => ({ eq: () => ({ single: async () => ({ data: stored }) }) }),
  }) };
  const route = load('src/app/api/orders/route.ts', { 'next/server': { NextResponse }, '@/lib/domains': domainModule, '@/lib/openprovider': domainProvider, '@/lib/register-domain': {registerPaidDomain: async () => {}}, '@/lib/supabase': { supabaseAdmin: db }, '@/lib/formation': catalog, '@/lib/billing': billingModule, '@/lib/contact': contactModule, '@/lib/business-mail': businessMailModule, '@/lib/members': membersModule, '@/lib/registered-agent': agentModule, '@/lib/payments': payments }, env);
  const request = body => new Request('http://localhost/api/orders', { method: 'POST', body: JSON.stringify(body) });
  assert.equal((await route.POST(request(valid))).status, 201);
  const retry = await route.POST(request(valid));
  assert.equal(retry.status, 200);
  assert.equal((await retry.json()).orderId, 'saved_order');
  assert.equal((await route.POST(request({ ...valid, state: 'Florida' }))).status, 409);
});
test('Stripe uses server prices, exclusive tax, billing prefill and idempotency keys', async () => {
  const calls = [];
  class StripeStub {
    customers = { create: async (body, options) => { calls.push({ kind: 'customer', body, options }); return { id: 'cus_test' }; } };
    checkout = { sessions: { create: async (body, options) => { calls.push({ kind: 'session', body, options }); return { id: 'cs_test', client_secret: 'cs_test_secret_test' }; } } };
  }
  const config = { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_example', STRIPE_SECRET_KEY: 'sk_test_example', STRIPE_WEBHOOK_SECRET: 'secret', STRIPE_TAX_READY: 'true', STRIPE_FORMATION_TAX_CODE: 'txcd_10000000', STRIPE_STATE_FEE_TAX_CODE: 'txcd_10000000', APP_URL: 'https://www.justmyllc.com' };
  const gateway = load('src/lib/payments.ts', { 'node:crypto': crypto, stripe: StripeStub, './billing': billingModule }, config);
  await gateway.createPayment({ id: 'internal_order', amount_usd: 102, state_fee_usd: 52, customer_email: 'test@example.com', billing_details: billingDetails });
  assert.equal(calls[0].body.name, billingDetails.name);
  assert.equal(calls[0].body.address.country, 'US');
  const { body, options } = calls[1];
  assert.equal(body.line_items.reduce((sum, item) => sum + item.price_data.unit_amount, 0), 10200);
  assert.equal(body.line_items.length, 2);
  assert.ok(body.line_items.every(item => item.price_data.tax_behavior === 'exclusive'));
  assert.equal(body.automatic_tax.enabled, true);
  assert.equal(body.billing_address_collection, 'required');
  assert.equal(body.customer, 'cus_test');
  assert.equal(body.client_reference_id, 'internal_order');
  assert.equal(body.ui_mode, 'embedded_page');
  assert.equal(body.redirect_on_completion, 'never');
  assert.equal(body.success_url, undefined);
  assert.equal(body.cancel_url, undefined);
  assert.equal(body.return_url, undefined);
  assert.equal(options.idempotencyKey, 'order:internal_order:checkout:embedded:v1');
  assert.equal(payments.paymentsConfigured(), false);
  await assert.rejects(() => gateway.createPayment({ id: 'bad', amount_usd: 102, customer_email: 'test@example.com' }));
  delete config.STRIPE_STATE_FEE_TAX_CODE;
  await assert.rejects(() => gateway.createPayment({ id: 'bad-tax', amount_usd: 102, state_fee_usd: 52, customer_email: 'test@example.com', billing_details: billingDetails }));
  assert.equal(calls.length, 2);
});
test('billing validation rejects invalid data and ignores untrusted extras', async () => {
  for (const billing of [null, { ...billingDetails, name: ' ' }, { ...billingDetails, address: { ...billingDetails.address, postalCode: 'bad' } }, { ...billingDetails, address: { ...billingDetails.address, country: 'ZZ' } }]) {
    assert.equal((await api().post({ ...valid, billing })).status, 400);
  }
  const route = api();
  assert.equal((await route.post({ ...valid, billing: { ...billingDetails, cardNumber: 'not-stored', address: { ...billingDetails.address, private: true } } })).status, 201);
  assert.equal(route.inserted().billing_details.name, 'Test User');
  assert.equal(route.inserted().billing_details.cardNumber, undefined);
  assert.equal(route.inserted().billing_details.address.private, undefined);
  assert.equal(route.inserted().payment_provider, 'stripe');
});

const contactDetails = { firstName: 'Example', lastName: 'Customer', country: 'AR', street: 'Example Street 123', addressLine2: '', city: 'Example City', region: '', postalCode: '' };
test('contact details are validated and saved without trusting unexpected fields', async () => {
  const route = api();
  assert.equal((await route.post({ ...valid, contact: { ...contactDetails, admin: true } })).status, 201);
  assert.equal(route.inserted().contact_details.country, 'AR');
  assert.equal(route.inserted().contact_details.admin, undefined);
  for (const change of [{ country: 'XX' }, { firstName: ' ' }, { street: 'x'.repeat(201) }, { city: null }]) {
    const invalid = api();
    assert.equal((await invalid.post({ ...valid, contact: { ...contactDetails, ...change } })).status, 400);
    assert.equal(invalid.inserted(), undefined);
  }
});

test('order update consent is explicit, requires a phone and is stored with its version', async () => {
  const route = api();
  assert.equal((await route.post({ ...valid, contact: contactDetails, customerPhone: '+15555550123', orderUpdatesConsent: true })).status, 201);
  assert.equal(route.inserted().contact_details.orderUpdatesConsent, true);
  assert.equal(route.inserted().contact_details.orderUpdatesConsentVersion, '2026-09-26');
  assert.ok(route.inserted().contact_details.orderUpdatesConsentAt);
  for (const change of [{ orderUpdatesConsent: 'true', customerPhone: '+15555550123' }, { orderUpdatesConsent: true, customerPhone: '' }]) {
    assert.equal((await api().post({ ...valid, contact: contactDetails, ...change })).status, 400);
  }
  const declined = api();
  assert.equal((await declined.post({ ...valid, contact: contactDetails, orderUpdatesConsent: false })).status, 201);
  assert.equal(declined.inserted().contact_details.orderUpdatesConsent, false);
  assert.equal(declined.inserted().contact_details.orderUpdatesConsentAt, null);
});

test('saved contact is absent for new devices and survives registration with validated fields only', () => {
  const storage = new Map();
  const localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  const saved = load('src/lib/saved-contact.ts', { './contact': contactModule }, {}, { localStorage });
  assert.equal(saved.readSavedContact(), null);
  saved.rememberRegisteredContact(contactDetails, 'test@example.com', '+15555550123');
  assert.equal(saved.readSavedContact().contact.firstName, 'Example');
  assert.equal(saved.readSavedContact().email, 'test@example.com');
  saved.forgetSavedContact();
  assert.equal(saved.readSavedContact(), null);
  storage.set(saved.SAVED_CONTACT_KEY, '{broken');
  assert.equal(saved.readSavedContact(), null);
  storage.set(saved.SAVED_CONTACT_KEY, JSON.stringify({ version: 1, contact: contactDetails, email: 'invalid', phone: '' }));
  assert.equal(saved.readSavedContact(), null);
});
test('unavailable browser storage never blocks registration', () => {
  const localStorage = { getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('blocked'); }, removeItem: () => { throw Error('blocked'); } };
  const saved = load('src/lib/saved-contact.ts', { './contact': contactModule }, {}, { localStorage });
  assert.equal(saved.readSavedContact(), null);
  assert.doesNotThrow(() => saved.rememberRegisteredContact(contactDetails, 'test@example.com', ''));
  assert.doesNotThrow(() => saved.forgetSavedContact());
});


test('business mail validates addresses and stores virtual requests without adding charges', async () => {
  const contact = { firstName: 'Test', lastName: 'User', country: 'US', street: '123 Main Street', addressLine2: '', city: 'Miami', region: 'Florida', postalCode: '33101' };
  for (const change of [{street:'P.O. Box 24'}, {addressLine2:'PO Box 3'}, {postalCode:'bad'}, {region:''}]) {
    const route = api();
    assert.equal((await route.post({...valid, contact, businessMail:{choice:'own',address:{...contact,...change}}})).status,400);
    assert.equal(route.inserted(),undefined);
  }
  for (const businessMail of [{choice:'own',address:contact},{choice:'virtual',status:'active',price:29}]) {
    const route = api();
    assert.equal((await route.post({...valid,contact,businessMail})).status,201);
    assert.equal(route.inserted().amount_usd,102);
    assert.equal(route.inserted().contact_details.businessMail.choice,businessMail.choice);
    if (businessMail.choice === 'virtual') assert.equal(route.inserted().contact_details.businessMail.status,'requested');
  }
  assert.match(businessMailModule.addressWarning('Louisiana',false),/Louisiana.*registered office/);
  assert.match(businessMailModule.addressWarning('Florida',false),/Florida.*principal office/);
  assert.match(businessMailModule.addressWarning('New Mexico',false),/New Mexico/);
});

test('plans and optional premium package are priced server-side with correct EIN inclusion', async () => {
  for (const [plan, fee] of [['basic',0],['standard',50],['premium',99]]) {
    assert.equal(catalog.includesEin(plan),fee >= 50);
    for (const premiumPackage of [false,true]) {
      const route = api();
      const result = await route.post({...valid,plan,premiumPackage,amount_usd:1,premium_package_fee_usd:1});
      assert.equal(result.status,201);
      assert.equal(route.inserted().amount_usd,52+fee+(premiumPackage ? 99 : 0));
      assert.equal(route.inserted().service_fee_usd,fee);
      assert.equal(route.inserted().plan_id,plan);
      assert.equal(route.inserted().premium_package,premiumPackage);
      assert.equal((await result.json()).quote.total,52+fee+(premiumPackage ? 99 : 0));
    }
  }
  for (const change of [{plan:'invalid'}, {plan:0}, {premiumPackage:'true'}]) assert.equal((await api().post({...valid,...change})).status,400);
});


test('owners validate names, count, company type and resolved addresses before saving', async () => {
  const contact = {firstName:'Test',lastName:'User',country:'US',street:'123 Main St',addressLine2:'',city:'Miami',region:'Florida',postalCode:'33101'};
  const member = {...membersModule.emptyMember(),firstName:'Test',lastName:'User'};
  const own = {choice:'own',address:contact};
  for (const businessMail of [own,{choice:'virtual'}]) {
    const route=api();
    assert.equal((await route.post({...valid,contact,businessMail,members:[member]})).status,201);
    const saved=route.inserted().contact_details.members[0];
    assert.equal(saved.firstName,'Test');
    assert.equal(saved.addressStatus,businessMail.choice === 'own' ? 'provided' : 'pending_virtual_assignment');
  }
  const route=api();
  assert.equal((await route.post({...valid,contact,businessMail:own,ownership:'multiple',members:[member,{...member,type:'company',companyName:'Example Holdings'}]})).status,201);
  assert.equal(route.inserted().contact_details.members[1].companyName,'Example Holdings');
  for (const members of [[],[{...member,firstName:' '}],[{...member,useBusinessAddress:false,address:{}}],[member,member]]) assert.equal((await api().post({...valid,contact,businessMail:own,members})).status,400);
  assert.equal(membersModule.parseMembers([{...member,type:'company',companyName:'Example'}],own,'S-Corp'),null);
});


test('registered agent enforces physical address and formation state', async () => {
  const contact={firstName:'Test',lastName:'User',country:'US',street:'123 Main St',addressLine2:'',city:'Miami',region:'Florida',postalCode:'33101'};
  const agent={...agentModule.EMPTY_AGENT,choice:'own',firstName:'Test',lastName:'User',street:'123 Main St',city:'Santa Fe',postalCode:'87501',state:'Florida'};
  const route=api();
  assert.equal((await route.post({...valid,contact,registeredAgent:agent})).status,201);
  assert.equal(route.inserted().contact_details.registeredAgent.address.region,'New Mexico');
  for(const change of [{street:'P.O. Box 9'},{postalCode:'bad'},{firstName:''},{type:'company',companyName:''}]) assert.equal((await api().post({...valid,contact,registeredAgent:{...agent,...change}})).status,400);
  assert.equal(agentModule.parseRegisteredAgent({choice:'service'},'Florida').status,'pending_assignment');
  assert.equal(agentModule.parseRegisteredAgent({...agent,type:'company',companyName:'Example Agent'},'Florida').companyName,'Example Agent');
});

test('EIN service adds $50 only when not already included and rejects invalid selection', async () => {
  for (const [plan, premiumPackage, einRequested, fee] of [['basic',false,true,50],['basic',false,false,0],['standard',false,true,0],['premium',false,true,0],['basic',true,true,0]]) {
    const route=api();
    assert.equal((await route.post({...valid,contact:contactDetails,plan,premiumPackage,einRequested,einFee:1})).status,201);
    assert.equal(route.inserted().amount_usd,catalog.getFormationQuote(valid.state,valid.entity,plan).total+(premiumPackage?99:0)+fee);
    assert.equal(route.inserted().contact_details.ein.feeUsd,fee);
  }
  const route=api();
  assert.equal((await route.post({...valid,contact:contactDetails,einRequested:'yes'})).status,400);
});

test('domain registration is optional, validated and priced on the server', async () => {
 const domainRegistration={name:'test-company.com',price:17.98,street:'Main Street',number:'123',phoneCountry:'+1',phoneArea:'305',phoneNumber:'5550123',consent:true};
 const contact={...contactDetails,postalCode:'1878'};
 const route=api();
 assert.equal((await route.post({...valid,contact,domainRegistration,domainFee:1})).status,201);
 assert.equal(route.inserted().amount_usd,119.98);
 assert.equal(route.inserted().domain_fee_usd,17.98);
 assert.equal(route.inserted().domain_status,'pending_payment');
 for(const patch of [{name:'bad.invalid'},{name:'https://example.com'},{consent:false},{phoneCountry:'1'},{number:''}]) {
  assert.equal((await api().post({...valid,contact,domainRegistration:{...domainRegistration,...patch}})).status,400);
 }
});

test('paid domain registration claims once and quarantines uncertain results', async () => {
 for (const fail of [false,true]) {
  let claimed=false, calls=0, status='pending_payment';
  const order={id:'order-domain',domain_fee_usd:17.98,domain_registration:{name:'example-test.com',street:'Main',number:'1',phoneCountry:'+1',phoneArea:'305',phoneNumber:'5550123'},contact_details:{...contactDetails,postalCode:'1878'},customer_email:'test@example.com'};
  const db={from:()=>({update:patch=>{
   const chain={eq:()=>chain,select:()=>chain,maybeSingle:async()=>{if(claimed)return {data:null};claimed=true;return {data:order};},then:resolve=>{if(patch.domain_status)status=patch.domain_status;return Promise.resolve(resolve({error:null}));}};return chain;
  }})};
  const domainRegistrationModule=load('src/lib/register-domain.ts',{'./supabase':{supabaseAdmin:db},'./openprovider':{checkDomain:async()=>({available:true,premium:false,price:17.98}),providerRequest:async path=>{calls++;if(path==='customers')return {handle:'TEST-HANDLE'};if(fail)throw new Error('Timeout');return {id:123,status:'ACT'};}}});
  await domainRegistrationModule.registerPaidDomain(order.id);
  assert.equal(status,fail?'needs_review':'registered');
  await domainRegistrationModule.registerPaidDomain(order.id);
  assert.equal(calls,2);
 }
});

test('domain search quotes USD reseller price plus $6 for each extension', async () => {
 const provider=load('src/lib/openprovider.ts',{'./domains':domainModule},{OPENPROVIDER_API_TOKEN:'test'},{fetch:async()=>({ok:true,json:async()=>({code:0,data:{results:[{domain:'example.com',status:'free',price:{reseller:{price:11.98,currency:'USD'}}},{domain:'example.net',status:'free',price:{reseller:{price:13,currency:'USD'}}},{domain:'example.org',status:'free',price:{reseller:{price:10,currency:'EUR'}}}]}})})});
 const results=await provider.checkDomains(['example.com','example.net','example.org']);
 assert.equal(results[0].price,17.98);assert.equal(results[1].price,19);assert.equal(results[2].price,null);
 assert.equal(domainModule.normalizeDomain('test.store'),'test.store');
});

test('domain endpoint loads five initial domains and ten remaining separately', async () => {
 const batches=[];
 const route=load('src/app/api/domains/search/route.ts',{'next/server':{NextResponse},'@/lib/domains':domainModule,'@/lib/openprovider':{checkDomains:async names=>{batches.push(names);return names.map(name=>({name}));}}});
 for(const batch of ['initial','remaining']) {
  const response=await route.POST(new Request('http://localhost/api/domains/search',{method:'POST',body:JSON.stringify({domain:'example',batch})}));
  assert.equal(response.status,200);
 }
 assert.equal(batches[0].length,5);assert.equal(batches[1].length,10);
 assert.equal(new Set([...batches[0],...batches[1]]).size,15);
});

test('website service charges $70 once only when explicitly selected', async () => {
 for(const selected of [true,false]) {
  const route=api();
  assert.equal((await route.post({...valid,contact:contactDetails,webService:selected,webServiceFeeUsd:1})).status,201);
  assert.equal(route.inserted().amount_usd,102+(selected?70:0));
  assert.equal(route.inserted().contact_details.webServiceFeeUsd,selected?70:0);
 }
 assert.equal((await api().post({...valid,contact:contactDetails,webService:'yes'})).status,400);
});


test('resuming embedded checkout rejects expired, foreign and mismatched sessions', async () => {
  let session = { id: 'cs_test', metadata: { order_id: 'order' }, client_reference_id: 'order', currency: 'usd', amount_subtotal: 10200, ui_mode: 'embedded_page', status: 'open', client_secret: 'cs_test_secret_test' };
  class StripeStub { checkout = { sessions: { retrieve: async () => session } }; }
  const gateway = load('src/lib/payments.ts', { 'node:crypto': crypto, stripe: StripeStub, './billing': billingModule }, { STRIPE_SECRET_KEY: 'sk_test_example' });
  const order = { id: 'order', checkout_id: 'cs_test', amount_usd: 102 };
  assert.equal((await gateway.resumePayment(order)).clientSecret, 'cs_test_secret_test');
  const validSession = { ...session };
  for (const patch of [{ status: 'expired' }, { ui_mode: 'hosted_page' }, { amount_subtotal: 1 }, { currency: 'eur' }, { metadata: { order_id: 'other' } }, { client_reference_id: 'other' }, { client_secret: null }]) {
    session = { ...validSession, ...patch };
    await assert.rejects(() => gateway.resumePayment(order));
  }
  session = { ...validSession, status: 'complete', client_secret: null };
  const completed = await gateway.resumePayment(order);
  assert.equal(completed.complete, true);
  assert.equal(completed.clientSecret, undefined);
});
