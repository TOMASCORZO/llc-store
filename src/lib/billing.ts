import { parseContact } from './contact';
import type { BusinessAddress } from './business-mail';

export type BillingDetails = { name: string; address: BusinessAddress };
export function parseBilling(value: unknown): BillingDetails | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > 200 || !data.address || typeof data.address !== 'object') return null;
  const parsed = parseContact({ ...data.address, firstName: 'Billing', lastName: 'Address' });
  if (!parsed || (parsed.country === 'US' && (!parsed.region || !/^\d{5}(-\d{4})?$/.test(parsed.postalCode)))) return null;
  const { country, street, addressLine2, city, region, postalCode } = parsed;
  return { name: data.name.trim(), address: { country, street, addressLine2, city, region, postalCode } };
}
