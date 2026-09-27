export const DOMAIN_PRICE_USD = 16;
export function normalizeDomain(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const domain = value.trim().toLowerCase();
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.com$/.test(domain) ? domain : null;
}
export type DomainRegistration = { name: string; street: string; number: string; phoneCountry: string; phoneArea: string; phoneNumber: string; consent: true };
export function parseDomainRegistration(value: unknown): DomainRegistration | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  const name = normalizeDomain(v.name);
  if (!name || v.consent !== true) return null;
  const fields: Record<string,string> = {};
  for (const [key, max] of Object.entries({street:200,number:20,phoneCountry:4,phoneArea:8,phoneNumber:15})) {
    if (typeof v[key] !== 'string' || !v[key].trim() || v[key].trim().length > max) return null;
    fields[key] = v[key].trim();
  }
  if (!/^\+[1-9]\d{0,2}$/.test(fields.phoneCountry) || !/^\d{1,8}$/.test(fields.phoneArea) || !/^\d{3,15}$/.test(fields.phoneNumber)) return null;
  return {name,street:fields.street,number:fields.number,phoneCountry:fields.phoneCountry,phoneArea:fields.phoneArea,phoneNumber:fields.phoneNumber,consent:true};
}
