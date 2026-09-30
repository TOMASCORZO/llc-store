import type { ReactNode } from 'react';
import type { ContactDetails } from '@/lib/contact';
import type { BusinessAddress, BusinessMail } from '@/lib/business-mail';
import type { Member } from '@/lib/members';
import type { AgentForm } from '@/lib/registered-agent';
import type { DomainRegistration } from '@/lib/domains';
import { formatUsd, includesEin, PREMIUM_PACKAGE_USD, type PlanId } from '@/lib/formation';

type Props = {
  es: boolean; companyName: string; entity: string; state: string; plan: PlanId;
  contact: ContactDetails; email: string; phone: string; updates: boolean; eligible: boolean;
  businessMail: BusinessMail | null; members: Member[]; agent: AgentForm;
  premium: boolean; ein: boolean; domain: DomainRegistration | null; web: boolean;
  onEdit: (step: number) => void;
};
const address = (value: BusinessAddress) => [value.street, value.addressLine2, value.city, value.region, value.postalCode, value.country].filter(Boolean).join(', ');

export default function CheckoutReview(p: Props) {
  const text = (en: string, es: string) => p.es ? es : en;
  const no = text('Not selected', 'No seleccionado');
  const yes = text('Included', 'Incluido');
  const mail = p.businessMail?.choice === 'own' ? address(p.businessMail.address) : text('Virtual address requested — awaiting confirmation', 'Dirección virtual solicitada — pendiente de confirmación');
  function field(label: string, value: ReactNode) { return <div className="review-field"><dt>{label}</dt><dd>{value || text('Not provided', 'No proporcionado')}</dd></div>; }
  function section(title: string, step: number, children: ReactNode) {
    return <section className="review-section" aria-label={title}><header><h2>{title}</h2><button type="button" onClick={() => p.onEdit(step)} aria-label={`${text('Edit', 'Editar')}: ${title}`}>{text('Edit', 'Editar')}</button></header>{children}</section>;
  }
  return <div className="checkout-review">
    <p className="review-intro">{text('Review your information. You can edit any section before continuing to payment.', 'Revisá tu información. Podés editar cada sección antes de continuar al pago.')}</p>
    <div className="review-company">{p.companyName}</div>
    {section(text('Company information', 'Información de la empresa'), 0, <dl>{field(text('Company name', 'Nombre de la empresa'), p.companyName)}{field('Plan', p.plan.charAt(0).toUpperCase() + p.plan.slice(1))}</dl>)}
    {section(text('Formation information', 'Información de constitución'), 1, <dl>{field(text('State of formation', 'Estado de constitución'), p.state)}{field(text('Entity type', 'Tipo de entidad'), p.entity)}{field(text('State filing time', 'Plazo de constitución'), text('To be confirmed', 'A confirmar'))}</dl>)}
    {section(text('Contact information', 'Información de contacto'), 2, <dl>{field(text('Full name', 'Nombre completo'), `${p.contact.firstName} ${p.contact.lastName}`)}{field(text('Address', 'Dirección'), address(p.contact))}{field(text('Phone number', 'Teléfono'), p.phone)}{field(text('Email address', 'Correo electrónico'), p.email)}{field(text('Order updates', 'Actualizaciones del pedido'), p.updates ? text('Authorized', 'Autorizadas') : text('Not authorized', 'No autorizadas'))}{p.entity === 'S-Corp' && field(text('S Corp eligibility', 'Elegibilidad S Corp'), p.eligible ? text('Confirmed', 'Confirmada') : text('Confirmation required', 'Falta confirmar'))}</dl>)}
    {section(text('Business mailing address', 'Dirección comercial'), 3, <dl>{field(text('Address', 'Dirección'), mail)}</dl>)}
    {section(text('Company owners', 'Propietarios de la empresa'), 5, <div>{p.members.map((member, index) => <dl className="review-owner" key={index}>{field(`${text('Owner', 'Propietario')} ${index + 1}`, member.type === 'company' ? member.companyName : `${member.firstName} ${member.lastName}`)}{field(text('Owner type', 'Tipo de propietario'), member.type === 'company' ? text('Company', 'Empresa') : text('Individual', 'Persona física'))}{field(text('Address', 'Dirección'), member.useBusinessAddress ? mail : address(member.address))}</dl>)}</div>)}
    {section(text('Registered agent', 'Agente registrado'), 6, p.agent.choice === 'service' ? <p>{text('You selected Just My LLC as your registered agent. Agent details are pending assignment.', 'Seleccionaste a Just My LLC como agente registrado. Los datos del agente están pendientes de asignación.')}</p> : <dl>{field(text('Name', 'Nombre'), p.agent.type === 'company' ? p.agent.companyName : `${p.agent.firstName} ${p.agent.lastName}`)}{field(text('Agent type', 'Tipo de agente'), p.agent.type === 'company' ? text('Company', 'Empresa') : text('Individual', 'Persona física'))}{field(text('Address', 'Dirección'), address({...p.agent, country: 'US', region: p.state}))}</dl>)}
    {section(text('Premium package', 'Paquete premium'), 4, <dl>{field(text('Selection', 'Selección'), p.premium ? formatUsd(PREMIUM_PACKAGE_USD) : no)}</dl>)}
    {section('EIN / Tax ID', includesEin(p.plan) ? 0 : p.premium ? 4 : 7, <dl>{field(text('Service', 'Servicio'), includesEin(p.plan) || p.premium ? yes : p.ein ? formatUsd(50) : no)}</dl>)}
    {section(text('Domain', 'Dominio'), 8, <dl>{field(text('Registration · 1 year', 'Registro · 1 año'), p.domain ? `${p.domain.name} · ${formatUsd(p.domain.price || 0)}` : no)}{p.domain && <>{field(text('Registrant', 'Titular'), `${p.contact.firstName} ${p.contact.lastName}`)}{field(text('Email', 'Correo electrónico'), p.email)}{field(text('Registrant address', 'Dirección del titular'), address({...p.contact, street: `${p.domain.street} ${p.domain.number}`}))}{field(text('Registrant phone', 'Teléfono del titular'), `${p.domain.phoneCountry} ${p.domain.phoneArea} ${p.domain.phoneNumber}`)}</>}</dl>)}
    {section(text('Website service', 'Servicio web'), 9, <dl>{field(text('Selection', 'Selección'), p.web ? text('$70 · One-time payment', '$70 · Pago único') : no)}</dl>)}
  </div>;
}
