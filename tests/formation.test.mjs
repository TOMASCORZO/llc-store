import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const prices = JSON.parse(fs.readFileSync('src/lib/formation-prices.json', 'utf8'));
function load(path, imports, env = {}) {
  const context = { exports: {}, require: name => imports[name], process: { env }, Intl };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText, context);
  return context.exports;
}
const catalog = load('src/lib/formation.ts', { './formation-prices.json': prices });
import { NextResponse } from 'next/server.js';
const env = { NEXT_PUBLIC_SUPABASE_URL: 'test', SUPABASE_SERVICE_ROLE_KEY: 'test' };
function api(config = env) {
  let inserted;
  const supabaseAdmin = { from: () => ({ insert: data => {
    inserted = data;
    return { select: () => ({ single: async () => ({ data: { id: 'test-order', status: data.status } }) }) };
  } }) };
  const route = load('src/app/api/orders/route.ts', { 'next/server': { NextResponse }, '@/lib/formation': catalog, '@/lib/supabase': { supabaseAdmin } }, config);
  return { post: body => route.POST(new Request('http://localhost/api/orders', { method: 'POST', body: JSON.stringify(body) })), inserted: () => inserted };
}
const valid = { customerName: 'Test User', customerEmail: 'test@example.com', llcName: 'Test Company', entity: 'LLC', state: 'New Mexico', designator: 'LLC', ownership: 'single', locale: 'es' };

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
  assert.equal(route.inserted().status, 'pending_review');
  assert.equal(route.inserted().locale, 'es');
});
test('rejects unavailable state/entity, wrong suffix, missing ownership and S Corp eligibility', async () => {
  for (const change of [ { state: 'invalid' }, { entity: 'C-Corp' }, { designator: 'Inc.' }, { ownership: null }, { customerName: ' ' }, { customerEmail: 'invalid' }, { entity: 'S-Corp', designator: 'Inc.', sCorpEligible: false }, { entity: 'S-Corp', designator: 'Inc.', state: 'Louisiana', sCorpEligible: true } ]) {
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
