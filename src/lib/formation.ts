import prices from './formation-prices.json';

export type EntityType = 'LLC' | 'S-Corp';
export const SERVICE_FEE_USD = 50;
export const PLAN_PRICES = { basic: 0, standard: 50, premium: 99 } as const;
export type PlanId = keyof typeof PLAN_PRICES;
export function isPlanId(value: unknown): value is PlanId { return typeof value === 'string' && Object.hasOwn(PLAN_PRICES, value); }
export function includesEin(plan: PlanId) { return PLAN_PRICES[plan] >= 50; }
export const PREMIUM_PACKAGE_USD = 99;
export const PRICE_VERIFIED_AT = '2026-09-19';
export const DEFAULT_STATE = 'New Mexico';

export function getStates(entity: EntityType) {
  return prices.filter(row => row.entity === entity && row.allowed).map(row => row.state);
}

export function getFormationQuote(state: string, entity: string, plan: PlanId = 'standard') {
  const row = prices.find(row => row.state === state && row.entity === entity && row.allowed);
  if (!row) return undefined;
  return { ...row, plan, einIncluded: includesEin(plan), serviceFee: PLAN_PRICES[plan], total: row.formationFee + row.stateFee + PLAN_PRICES[plan], verifiedAt: PRICE_VERIFIED_AT };
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
