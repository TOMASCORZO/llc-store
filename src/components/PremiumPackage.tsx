'use client';
import { useLanguage } from '@/i18n/LanguageContext';
export default function PremiumPackage({ entity }: { entity: string }) {
  const { lang } = useLanguage();
  const es = lang === 'es';
  const items = [
    { key: 'ein', title: 'EIN', subtitle: es ? 'Incluido en tu constitución' : 'Included with your formation', description: es ? 'Identificación fiscal de tu empresa para trámites y servicios bancarios.' : 'Your business tax identification for filings and banking services.' },
    { key: 'agreement', title: entity === 'LLC' ? 'Operating Agreement' : 'Corporate Bylaws', subtitle: '', description: es ? 'Documenta la estructura, titularidad y funcionamiento de tu empresa.' : 'Document your company’s structure, ownership, and operating procedures.' },
    { key: 'banking', title: 'Banking Resolution', subtitle: '', description: es ? 'Designa quién puede gestionar las cuentas bancarias de la empresa.' : 'Designate who can manage your company’s bank accounts.' },
    { key: 'contracts', title: es ? 'Biblioteca de contratos' : 'Contract Library', subtitle: '', description: es ? 'Plantillas de documentos para las necesidades de tu negocio.' : 'Business document templates for your company’s everyday needs.' },
  ];
  return <div className="premium-package" lang={es ? 'es' : 'en'}>
    <p className="contact-intro">{es ? 'Sumá documentos esenciales para tu negocio por $99 adicionales. Tu EIN ya está incluido en la constitución.' : 'Add essential business documents for an additional $99. Your EIN is already included with formation.'}</p>
    <div className="premium-grid">{items.map(item => <article className="premium-card" key={item.key}>
      <div className={`premium-art premium-art-${item.key}`} role="img" aria-label={`${item.title} — ${es ? 'vista ilustrativa' : 'illustrative preview'}`}>
        {item.key === 'ein' ? <div className="premium-phone"><div className="premium-island"/><b>just my llc</b><small>BUSINESS DOCUMENTS</small><strong>EIN</strong><span className="premium-ready">✓ Ready</span><div className="premium-paper-lines"/><span className="premium-file">▤ EIN document</span></div> : <div className="premium-document"><small>JUST MY LLC</small><strong>{item.key === 'agreement' ? (entity === 'LLC' ? 'OPERATING' : 'CORPORATE') : item.key === 'banking' ? 'BANKING' : 'BUSINESS'}</strong><b>{item.key === 'agreement' ? (entity === 'LLC' ? 'AGREEMENT' : 'BYLAWS') : item.key === 'banking' ? 'RESOLUTION' : 'CONTRACTS'}</b><div className="premium-paper-lines"/><span className="premium-signature">J. Smith</span><div className="premium-paper-lines"/></div>}
      </div>
      <div className="premium-card-copy"><h2>{item.title}</h2>{item.subtitle && <span className="premium-included">{item.subtitle}</span>}<p>{item.description}</p></div>
    </article>)}</div>
    <div className="premium-price"><span>{es ? 'Total del paquete' : 'Package total'}</span><strong>$99<small>{es ? 'Pago único' : 'One-time payment'}</small></strong></div>
  </div>;
}
