import { parseContact, type ContactDetails } from './contact';
export type BusinessAddress = Omit<ContactDetails, 'firstName' | 'lastName'>;
export type BusinessMail = { choice: 'own'; address: BusinessAddress } | { choice: 'virtual'; status: 'requested' };
export const EMPTY_BUSINESS_ADDRESS: BusinessAddress = { country: 'US', street: '', addressLine2: '', city: '', region: '', postalCode: '' };
export function isPoBox(street: string): boolean { return /\b(?:p\.?\s*o\.?\s*box|post\s+office\s+box)\b/i.test(street); }
export function parseBusinessMail(value: unknown): BusinessMail | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (data.choice === 'virtual') return { choice: 'virtual', status: 'requested' };
  if (data.choice !== 'own' || !data.address || typeof data.address !== 'object') return null;
  const parsed = parseContact({ ...data.address, firstName: 'Business', lastName: 'Address' });
  if (!parsed || isPoBox(parsed.street) || isPoBox(parsed.addressLine2)) return null;
  if (parsed.country === 'US' && (!parsed.region || !/^\d{5}(-\d{4})?$/.test(parsed.postalCode))) return null;
  const { country, street, addressLine2, city, region, postalCode } = parsed;
  return { choice: 'own', address: { country, street, addressLine2, city, region, postalCode } };
}
export function addressWarning(state: string, es: boolean): string {
  // Louisiana's registered-office rule is distinct from mailing-address requirements.
  if (state === 'Louisiana') return es ? 'Louisiana no acepta un P.O. Box como única dirección de la oficina registrada. Se necesita una dirección física; la dirección postal se trata por separado.' : 'Louisiana does not accept a P.O. Box as the only registered office address. A physical street address is required; mailing addresses are handled separately.';
  if (state === 'Florida') return es ? 'Florida requiere una dirección física para la oficina principal. Un P.O. Box puede usarse como dirección postal, pero no como dirección física.' : 'Florida requires a physical street address for the principal office. A P.O. Box can be used for mailing, but not as the physical address.';
  return es ? `Para tu constitución en ${state}, ingresá una dirección física en este formulario, no un P.O. Box. Los requisitos de dirección postal se revisan por separado.` : `For your ${state} formation, enter a physical street address in this form, not a P.O. Box. Mailing-address requirements are reviewed separately.`;
}
