import type { BillingDetails } from '@/lib/billing';
import type { BusinessAddress } from '@/lib/business-mail';
import { COUNTRY_CODES } from '@/lib/contact';

type Props = {
  es: boolean; value: BillingDetails; onChange: (value: BillingDetails) => void;
  contactName: string; companyName: string; contactAddress: BusinessAddress; businessAddress?: BusinessAddress;
};
export default function BillingInformation({ es, value, onChange, contactName, companyName, contactAddress, businessAddress }: Props) {
  const text = (en: string, spanish: string) => es ? spanish : en;
  const countries = new Intl.DisplayNames([es ? 'es' : 'en'], { type: 'region' });
  const format = (a: BusinessAddress) => [a.street, a.addressLine2, a.city, a.region, a.postalCode, a.country].filter(Boolean).join(', ');
  const sameAddress = (a: BusinessAddress) => (Object.keys(value.address) as (keyof BusinessAddress)[]).every(key => value.address[key] === a[key]);
  function field(key: keyof BusinessAddress, label: string, autoComplete: string, maxLength: number, required = true) {
    return <div className="form-group"><label htmlFor={`billing-${key}`}>{label}</label><input id={`billing-${key}`} autoComplete={`billing ${autoComplete}`} required={required} pattern={required ? (key === 'postalCode' && value.address.country === 'US' ? '[0-9]{5}(-[0-9]{4})?' : '.*\\S.*') : undefined} maxLength={maxLength} value={value.address[key]} onChange={e => onChange({ ...value, address: { ...value.address, [key]: e.target.value } })} /></div>;
  }
  return <section className="billing-information" aria-labelledby="billing-title">
    <h2 id="billing-title">{text('Billing information', 'Información de facturación')}</h2>
    <div className="billing-method"><span aria-hidden="true">◉</span><strong>{text('Pay by card', 'Pagar con tarjeta')}</strong><span className="billing-stripe">Stripe</span></div>
    <p className="formation-note">{text('Enter your billing details below. On the next screen, Stripe will securely collect your card details and show the final total, including applicable taxes, before you pay.', 'Completá los datos de facturación. En la siguiente pantalla, Stripe solicitará los datos de tu tarjeta de forma segura y mostrará el total final, incluidos los impuestos aplicables, antes de pagar.')}</p>
    <h3>{text('Billing name', 'Nombre de facturación')}</h3>
    <div className="billing-shortcuts">
      <button type="button" className="billing-reuse" aria-pressed={value.name === contactName} onClick={() => onChange({ ...value, name: contactName })}><span>{text('Use contact name', 'Usar nombre de contacto')}</span><strong>{contactName}</strong></button>
      <button type="button" className="billing-reuse" aria-pressed={value.name === companyName} onClick={() => onChange({ ...value, name: companyName })}><span>{text('Use company name', 'Usar nombre de la empresa')}</span><strong>{companyName}</strong></button>
    </div>
    <div className="form-group"><label htmlFor="billing-name">{text('Full name or company name', 'Nombre completo o razón social')}</label><input id="billing-name" autoComplete="billing name" required pattern=".*\S.*" maxLength={200} value={value.name} onChange={e => onChange({ ...value, name: e.target.value })}/></div>
    <h3>{text('Billing address', 'Dirección de facturación')}</h3>
    <div className="billing-shortcuts">
      <button type="button" className="billing-reuse" aria-pressed={sameAddress(contactAddress)} onClick={() => onChange({ ...value, address: { ...contactAddress } })}><span>{text('Use contact address', 'Usar dirección de contacto')}</span><strong>{format(contactAddress)}</strong></button>
      {businessAddress && <button type="button" className="billing-reuse" aria-pressed={sameAddress(businessAddress)} onClick={() => onChange({ ...value, address: { ...businessAddress } })}><span>{text('Use business address', 'Usar dirección comercial')}</span><strong>{format(businessAddress)}</strong></button>}
    </div>
    <div className="form-group"><label htmlFor="billing-country">{text('Country', 'País')}</label><select id="billing-country" autoComplete="billing country" required value={value.address.country} onChange={e => onChange({ ...value, address: { ...value.address, country: e.target.value } })}><option value="" disabled>{text('Select country', 'Seleccioná un país')}</option>{COUNTRY_CODES.map(code => ({ code, name: countries.of(code) || code })).sort((a, b) => a.name.localeCompare(b.name)).map(({ code, name }) => <option value={code} key={code}>{name}</option>)}</select></div>
    <div className="contact-street">{field('street',text('Street address','Dirección'),'address-line1',200)}{field('addressLine2',text('Apartment, suite (optional)','Departamento, piso (opcional)'),'address-line2',200,false)}</div>
    <div className="contact-city">{field('city',text('City','Ciudad'),'address-level2',100)}{field('region',text('State / province','Estado / provincia'),'address-level1',100,value.address.country === 'US')}{field('postalCode',text('Postal code','Código postal'),'postal-code',20,value.address.country === 'US')}</div>
    <p className="billing-notice">{text('Use the billing name and address associated with your payment method. You can edit all fields, even after reusing your company or contact details.', 'Usá el nombre y la dirección de facturación asociados a tu medio de pago. Podés editar todos los campos, incluso después de reutilizar los datos de tu empresa o contacto.')}</p>
  </section>;
}
