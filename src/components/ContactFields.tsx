'use client';
import { useLanguage } from '@/i18n/LanguageContext';
import { COUNTRY_CODES, ContactDetails } from '@/lib/contact';
export default function ContactFields({ value, onChange }: { value: ContactDetails; onChange: (value: ContactDetails) => void }) {
  const { lang } = useLanguage();
  const es = lang === 'es';
  const labels = es ? ['Nombre','Apellido','País','Dirección','Departamento, piso, etc. (opcional)','Ciudad','Estado / provincia (si corresponde)','Código postal (si corresponde)'] : ['First name','Last name','Country','Street address','Apartment, suite, etc. (optional)','City','State / province (if applicable)','Postal code (if applicable)'];
  const names = new Intl.DisplayNames([lang], { type: 'region' });
  function field(key: keyof ContactDetails, label: string, autoComplete: string, maxLength: number, required = true) {
    return <div className="form-group"><label htmlFor={`contact-${key}`}>{label}</label><input id={`contact-${key}`} autoComplete={autoComplete} required={required} pattern={required ? '.*\\S.*' : undefined} maxLength={maxLength} value={value[key]} onChange={e => onChange({ ...value, [key]: e.target.value })} /></div>;
  }
  return <div lang={es ? 'es' : 'en'}>
    <p className="contact-intro">{es ? 'Usaremos estos datos para enviarte actualizaciones del pedido y los documentos de tu empresa.' : 'We’ll use these details to send order updates and share your company documents.'}</p>
    <div className="form-row">{field('firstName',labels[0],'given-name',90)}{field('lastName',labels[1],'family-name',90)}</div>
    <div className="contact-address">
      <div className="form-group"><label htmlFor="contact-country">{labels[2]}</label><select id="contact-country" autoComplete="country" required value={value.country} onChange={e=>onChange({...value,country:e.target.value})}><option value="" disabled>{es ? 'Seleccioná tu país' : 'Select your country'}</option>{COUNTRY_CODES.map(code=>({code,name:names.of(code) || code})).sort((a,b)=>a.name.localeCompare(b.name,lang)).map(({code,name})=><option key={code} value={code}>{name}</option>)}</select></div>
      <div className="contact-street">{field('street',labels[3],'address-line1',200)}{field('addressLine2',labels[4],'address-line2',200,false)}</div>
      <div className="contact-city">{field('city',labels[5],'address-level2',100)}{field('region',labels[6],'address-level1',100,false)}{field('postalCode',labels[7],'postal-code',20,false)}</div>
    </div>
  </div>;
}
