'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { EIN_SERVICE_USD, formatUsd } from '@/lib/formation';

export default function EinStep({ companyName, included, value, onChange }: { companyName: string; included: boolean; value: boolean | null; onChange: (value: boolean) => void }) {
  const { lang } = useLanguage();
  const es = lang === 'es';
  return <section className="ein-step" lang={es ? 'es' : 'en'}>
    <h2 className="t-h4">{es ? `Información del EIN / Tax ID para ${companyName}` : `EIN / Tax ID information for ${companyName}`}</h2>
    <p className="contact-intro">{es ? 'El EIN es el número de identificación fiscal federal que el IRS asigna a tu empresa.' : 'An EIN is the federal tax identification number assigned to your business by the IRS.'}</p>
    <div className="ein-benefits"><h3 className="t-h4">{es ? 'Un EIN ayuda a tu empresa a:' : 'An EIN helps your business:'}</h3>
    <ul className="agent-benefits">{(es ? ['Abrir una cuenta bancaria empresarial.', 'Administrar la nómina y los impuestos de empleados.', 'Identificarse en trámites fiscales federales.'] : ['Open a business bank account.', 'Manage employee payroll and employment taxes.', 'Identify itself on federal tax filings.']).map(text => <li key={text}><span aria-hidden="true">✓</span>{text}</li>)}</ul></div>
    {included ? <div className="ein-included"><span aria-hidden="true">✓</span><div><strong>{es ? 'EIN incluido en tu constitución' : 'EIN included in your formation'}</strong><p>{es ? 'Tu plan o paquete ya incluye este servicio. No se agrega ningún cargo.' : 'Your selected plan or package already includes this service. There is no additional charge.'}</p></div></div> : <div className="mail-choices ein-options" role="radiogroup" aria-label={es ? 'Servicio de EIN' : 'EIN service'}>
      <label className={`${value === false ? 'selected' : ''}`}><input type="radio" name="ein-service" required checked={value === false} onChange={() => onChange(false)}/><span>{es ? 'No necesito que Just My LLC tramite mi EIN.' : 'I don’t need Just My LLC to obtain my EIN.'}</span></label>
      <label className={`${value === true ? 'selected' : ''}`}><input type="radio" name="ein-service" required checked={value === true} onChange={() => onChange(true)}/><span>{es ? 'Sí, quiero que Just My LLC tramite mi EIN por ' : 'Yes, I’d like Just My LLC to obtain my EIN for '}<strong>{formatUsd(EIN_SERVICE_USD)}</strong>.</span></label>
    </div>}
    <p className="formation-note">{es ? 'El IRS emite el EIN sin costo. Los $50 corresponden a nuestro servicio de gestión.' : 'The IRS issues EINs free of charge. The $50 is our service fee.'}</p>
  </section>;
}
