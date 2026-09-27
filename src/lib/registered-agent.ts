import { parseBusinessMail } from './business-mail';
export type AgentForm = { choice: 'service' | 'own'; type: 'individual' | 'company'; useContactName: boolean; firstName: string; lastName: string; companyName: string; street: string; addressLine2: string; city: string; postalCode: string };
export const EMPTY_AGENT: AgentForm = { choice: 'service', type: 'individual', useContactName: false, firstName: '', lastName: '', companyName: '', street: '', addressLine2: '', city: '', postalCode: '' };
export function parseRegisteredAgent(value: unknown, state: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (data.choice === 'service') return { choice: 'service', status: 'pending_assignment', state };
  if (data.choice !== 'own' || !['individual','company'].includes(String(data.type))) return null;
  const name = (key: string, max: number) => typeof data[key] === 'string' && data[key].trim().length <= max ? data[key].trim() : '';
  const firstName = name('firstName',90), lastName = name('lastName',90), companyName = name('companyName',200);
  if (data.type === 'individual' ? !firstName || !lastName : !companyName) return null;
  const mail = parseBusinessMail({choice:'own',address:{country:'US',region:state,street:data.street,addressLine2:data.addressLine2,city:data.city,postalCode:data.postalCode}});
  if (!mail || mail.choice !== 'own') return null;
  return {choice:'own',type:data.type,firstName:data.type === 'individual' ? firstName : '',lastName:data.type === 'individual' ? lastName : '',companyName:data.type === 'company' ? companyName : '',address:mail.address};
}
