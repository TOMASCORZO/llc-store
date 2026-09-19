import prices from './formation-prices.json';

export type EntityType = 'LLC' | 'S-Corp';
export const SERVICE_FEE_USD = 50;
export const PRICE_VERIFIED_AT = '2026-09-19';
export const DEFAULT_STATE = 'New Mexico';

export function getStates(entity: EntityType) {
  return prices.filter(row => row.entity === entity && row.allowed).map(row => row.state);
}

export function getFormationQuote(state: string, entity: string) {
  const row = prices.find(row => row.state === state && row.entity === entity && row.allowed);
  if (!row) return undefined;
  return { ...row, serviceFee: SERVICE_FEE_USD, total: row.formationFee + row.stateFee + SERVICE_FEE_USD, verifiedAt: PRICE_VERIFIED_AT };
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
