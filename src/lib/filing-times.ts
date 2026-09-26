import data from './filing-times.json';
import type { EntityType } from './formation';

export type FilingTime = {
  availability: 'pending' | 'available' | 'unavailable';
  minBusinessDays: number | null;
  maxBusinessDays: number | null;
  additionalFeeUsd: number | null;
};
export type StateFilingTimes = {
  state: string;
  entity: EntityType;
  standard: FilingTime;
  expedited: FilingTime;
  sourceUrl: string | null;
  verifiedAt: string | null;
};

// This catalog describes timing only. Paid expedited checkout must be wired to
// server pricing and order storage before it can be enabled for purchase.
export function getStateFilingTimes(state: string, entity: EntityType) {
  return (data as StateFilingTimes[]).find(row => row.state === state && row.entity === entity);
}
