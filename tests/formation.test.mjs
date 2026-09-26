import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';
const prices = JSON.parse(fs.readFileSync('src/lib/formation-prices.json', 'utf8'));
function load(path, imports, env = {}, globals = {}) {
  const context = { exports: {}, require: name => imports[name], process: { env }, Intl, Buffer, URL, AbortSignal, ...globals };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText, context);
  return context.exports;
}
const contactModule = load('src/lib/contact.ts', {});
const payments = load('src/lib/payments.ts', { 'node:crypto': crypto });
const catalog = load('src/lib/formation.ts', { './formation-prices.json': prices });
import { NextResponse } from 'next/server.js';
const env = { NEXT_PUBLIC_SUPABASE_URL: 'test', SUPABASE_SERVICE_ROLE_KEY: 'test' };
function api(config = env) {
  let inserted;
  const supabaseAdmin = { from: () => ({ insert: data => {
    inserted = data;
    return { select: () => ({ single: async () => ({ data: { id: 'test-order', status: data.status } }) }) };
  } }) };
  const route = load('src/app/api/orders/route.ts', { 'next/server': { NextResponse }, '@/lib/contact': contactModule, '@/lib/payments': payments, '@/lib/formation': catalog, '@/lib/supabase': { supabaseAdmin } }, config);
  return { post: body => route.POST(new Request('http://localhost/api/orders', { method: 'POST', body: JSON.stringify(body) })), inserted: () => inserted };
}
const valid = { orderToken: 'a'.repeat(64), acceptTerms: true, customerName: 'Test User', customerEmail: 'test@example.com', llcName: 'Test Company', entity: 'LLC', state: 'New Mexico', designator: 'LLC', ownership: 'single', locale: 'es' };

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

test('webhook signature rejects altered payloads, wrong secrets and invalid signatures', () => {
  const raw = JSON.stringify({ eventType: 'checkout.completed' });
  const signature = crypto.createHmac('sha256', 'secret').update(raw).digest('hex');
  assert.equal(payments.verifySignature(raw, signature, 'secret'), true);
  assert.equal(payments.verifySignature(raw + ' ', signature, 'secret'), false);
  assert.equal(payments.verifySignature(raw, signature, 'wrong'), false);
  assert.equal(payments.verifySignature(raw, null, 'secret'), false);
  assert.equal(payments.verifySignature(raw, 'invalid', 'secret'), false);
});
test('webhook only marks matching, signed, paid orders as paid; replay is harmless', async () => {
  const config = { CREEM_WEBHOOK_SECRET: 'secret', CREEM_PRODUCT_ID: 'prod_test' };
  const stored = { id: 'order_test', status: 'pending_payment', checkout_id: 'ch_test', amount_usd: 102, payment_id: null };
  let updates = 0;
  const db = { from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: stored }) }) }),
    update: values => ({ eq: () => ({ eq: async () => { Object.assign(stored, values); updates++; return {}; } }) }),
  }) };
  const route = load('src/app/api/webhook/route.ts', { 'next/server': { NextResponse }, '@/lib/contact': contactModule, '@/lib/payments': payments, '@/lib/supabase': { supabaseAdmin: db } }, config);
  const event = { eventType: 'checkout.completed', object: { id: 'ch_test', status: 'completed', metadata: { order_id: 'order_test' }, order: { id: 'pay_test', status: 'paid', product: 'prod_test', currency: 'USD', amount: 10200 } } };
  async function post(body, signed = true) {
    const raw = JSON.stringify(body);
    return route.POST(new Request('http://localhost/api/webhook', { method: 'POST', body: raw, headers: signed ? { 'creem-signature': crypto.createHmac('sha256', 'secret').update(raw).digest('hex') } : {} }));
  }
  assert.equal((await post(event, false)).status, 401);
  for (const change of [{ amount: 1 }, { currency: 'EUR' }, { status: 'pending' }, { product: 'other' }]) {
    assert.equal((await post({ ...event, object: { ...event.object, order: { ...event.object.order, ...change } } })).status, 400);
  }
  assert.equal(updates, 0);
  assert.equal((await post(event)).status, 200);
  assert.equal(stored.status, 'paid');
  assert.equal((await post(event)).status, 200);
  assert.equal(updates, 1);
});

test('payment retries reuse a stored session and concurrent attempts cannot create a second one', async () => {
  let starts = 0;
  const stored = { id: 'order', status: 'pending_payment', amount_usd: 102, customer_email: 'test@example.com', checkout_url: null };
  let claimed = false;
  const db = { from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: { ...stored } }) }) }),
    update: values => ({ eq: () => {
      if (values.checkout_url) { Object.assign(stored, values); return Promise.resolve({}); }
      return { is: () => ({ eq: () => ({ select: () => ({ maybeSingle: async () => {
        if (claimed) return { data: null };
        claimed = true;
        return { data: { id: stored.id } };
      } }) }) }) };
    } }),
  }) };
  const route = load('src/app/api/orders/payment/route.ts', { 'next/server': { NextResponse }, '@/lib/supabase': { supabaseAdmin: db }, '@/lib/payments': { ...payments, paymentsConfigured: () => true, createPayment: async () => { starts++; return { id: 'ch_test', url: 'https://www.creem.io/payment/test' }; } } });
  const request = () => new Request('http://localhost/api/orders/payment', { method: 'POST', headers: { Authorization: `Bearer ${'a'.repeat(64)}` } });
  const results = await Promise.all([route.POST(request()), route.POST(request())]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  assert.equal(starts, 1);
  assert.equal((await route.POST(request())).status, 200);
  assert.equal(starts, 1);
  stored.status = 'paid';
  assert.equal((await route.POST(request())).status, 409);
});
test('payment endpoint fails closed without configuration or access token', async () => {
  const route = load('src/app/api/orders/payment/route.ts', { 'next/server': { NextResponse }, '@/lib/supabase': {}, '@/lib/contact': contactModule, '@/lib/payments': payments });
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
  const route = load('src/app/api/orders/route.ts', { 'next/server': { NextResponse }, '@/lib/supabase': { supabaseAdmin: db }, '@/lib/formation': catalog, '@/lib/contact': contactModule, '@/lib/payments': payments }, env);
  const request = body => new Request('http://localhost/api/orders', { method: 'POST', body: JSON.stringify(body) });
  assert.equal((await route.POST(request(valid))).status, 201);
  const retry = await route.POST(request(valid));
  assert.equal(retry.status, 200);
  assert.equal((await retry.json()).orderId, 'saved_order');
  assert.equal((await route.POST(request({ ...valid, state: 'Florida' }))).status, 409);
});
test('provider checkout uses exact server amount in cents and a fixed return origin', async () => {
  let sent;
  const gateway = load('src/lib/payments.ts', { 'node:crypto': crypto }, {
    CREEM_API_KEY: 'test_key', CREEM_PRODUCT_ID: 'prod_test', CREEM_WEBHOOK_SECRET: 'secret', APP_URL: 'https://www.justmyllc.com', CREEM_TEST_MODE: 'true',
  }, { fetch: async (url, options) => {
    sent = { url, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ id: 'ch_test', checkout_url: 'https://www.creem.io/test/payment/ch_test' }) };
  } });
  await gateway.createPayment({ id: 'internal_order', amount_usd: 102, customer_email: 'test@example.com' });
  assert.equal(sent.url, 'https://test-api.creem.io/v1/checkouts');
  assert.equal(sent.body.custom_price, 10200);
  assert.equal(sent.body.units, 1);
  assert.equal(sent.body.request_id, 'internal_order');
  assert.equal(sent.body.metadata.order_id, 'internal_order');
  assert.equal(sent.body.success_url, 'https://www.justmyllc.com/checkout/confirmation?order=internal_order');
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
