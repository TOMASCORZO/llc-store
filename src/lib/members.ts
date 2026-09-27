import { parseContact } from './contact';
import type { BusinessAddress, BusinessMail } from './business-mail';
export type Member = { type: 'individual' | 'company'; firstName: string; lastName: string; companyName: string; useContactName: boolean; useBusinessAddress: boolean; address: BusinessAddress };
export function emptyMember(): Member { return { type: 'individual', firstName: '', lastName: '', companyName: '', useContactName: false, useBusinessAddress: true, address: { country: 'US', street: '', addressLine2: '', city: '', region: '', postalCode: '' } }; }
export function parseMembers(value: unknown, businessMail?: BusinessMail | null, entity = 'LLC') {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return null;
  const result = [];
  for (const item of value) {
    if (!item || !['individual', 'company'].includes(item.type) || typeof item.useBusinessAddress !== 'boolean') return null;
    if (entity === 'S-Corp' && item.type === 'company') return null;
    const firstName = typeof item.firstName === 'string' ? item.firstName.trim() : '';
    const lastName = typeof item.lastName === 'string' ? item.lastName.trim() : '';
    const companyName = typeof item.companyName === 'string' ? item.companyName.trim() : '';
    if (item.type === 'individual' ? (!firstName || !lastName || firstName.length > 90 || lastName.length > 90) : (!companyName || companyName.length > 200)) return null;
    let address: BusinessAddress | null = null;
    if (item.useBusinessAddress) {
      if (!businessMail) return null;
      if (businessMail.choice === 'own') address = businessMail.address;
    } else {
      const parsed = parseContact({ ...item.address, firstName: 'Member', lastName: 'Address' });
      if (!parsed) return null;
      const { country, street, addressLine2, city, region, postalCode } = parsed;
      address = { country, street, addressLine2, city, region, postalCode };
    }
    result.push({ type: item.type as Member['type'], firstName: item.type === 'individual' ? firstName : '', lastName: item.type === 'individual' ? lastName : '', companyName: item.type === 'company' ? companyName : '', useBusinessAddress: item.useBusinessAddress, address, addressStatus: address ? 'provided' : 'pending_virtual_assignment' });
  }
  return result;
}
