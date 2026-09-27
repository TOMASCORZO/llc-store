export const DOMAIN_MANAGEMENT_USD = 6;
export const DOMAIN_EXTENSIONS = ['com','net','org','co','info','biz','online','site','store','tech','xyz','shop','website','space','cloud'];
export type DomainResult = {name:string;available:boolean;premium:boolean;price:number|null};
export function normalizeDomain(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const domain = value.trim().toLowerCase();
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]+$/.test(domain) && DOMAIN_EXTENSIONS.includes(domain.split('.')[1]) ? domain : null;
}
export type DomainRegistration = { name: string; price?: number; street: string; number: string; phoneCountry: string; phoneArea: string; phoneNumber: string; consent: true };
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
  return {name,...(typeof v.price === 'number' && Number.isFinite(v.price) && v.price > 0 ? {price:v.price} : {}),street:fields.street,number:fields.number,phoneCountry:fields.phoneCountry,phoneArea:fields.phoneArea,phoneNumber:fields.phoneNumber,consent:true};
}
