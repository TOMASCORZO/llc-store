'use client';
import { useLanguage } from '@/i18n/LanguageContext';
export default function WebServiceStep({companyName}:{companyName:string}) {
  const {lang}=useLanguage();const es=lang==='es';
  return <div className="premium-package web-service">
    <div className="web-service-visual" role="img" aria-label={es?'Vista ilustrativa de tu web en computadora y celular':'Illustrative desktop and mobile website preview'}>
      <div className="web-browser"><div className="web-browser-bar"><i/><i/><i/><span>{companyName || 'Your business'}</span></div><div className="web-browser-content"><small>{companyName || 'YOUR BUSINESS'}</small><h2>{es?'Una gran idea.\nUn nuevo comienzo.':'A great idea.\nA fresh start.'}</h2><p>{es?'Construí algo que importe.':'Build something that matters.'}</p><span className="web-mock-cta">{es?'Conocenos':'Discover more'} ↗</span><div className="web-mock-tiles"><i/><i/><i/></div></div></div>
      <div className="web-mobile"><div className="web-mobile-island"/><small>{companyName || 'YOUR BUSINESS'}</small><div className="web-mobile-orb"/><strong>{es?'Hola, mundo.':'Hello, world.'}</strong><div className="premium-paper-lines"/><span className="web-mock-cta">{es?'Empezar':'Get started'} ↗</span></div>
      <span className="web-preview-label">{es?'Vista ilustrativa':'Illustrative preview'}</span>
    </div>
  </div>;
}
