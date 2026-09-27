'use client';
import { useLanguage } from '@/i18n/LanguageContext';
export default function WebServiceStep({companyName}:{companyName:string}) {
  const {lang}=useLanguage();const es=lang==='es';
  const items=es ? [['01','Tu identidad online','Una web que presente tu empresa y lo que ofrecés.'],['02','Diseño para cada pantalla','Una experiencia pensada para computadoras y celulares.'],['03','Un lugar para conectar','Mostrá tus servicios y facilitá que te contacten.'],['04','El próximo paso de tu negocio','Definimos juntos el alcance de tu proyecto web.']] : [['01','Your online identity','A website that introduces your business and what you offer.'],['02','Designed for every screen','An experience designed for desktop and mobile.'],['03','A place to connect','Showcase your services and help visitors get in touch.'],['04','Your next business milestone','Define the scope of your website project with our team.']];
  return <div className="premium-package web-service"><p className="contact-intro">{es?'Tu empresa está por nacer. Dale una web para presentarse al mundo.':'Your business is about to launch. Give it a website to meet the world.'}</p>
    <div className="web-service-visual" role="img" aria-label={es?'Vista ilustrativa de tu web en computadora y celular':'Illustrative desktop and mobile website preview'}>
      <div className="web-browser"><div className="web-browser-bar"><i/><i/><i/><span>{companyName || 'Your business'}</span></div><div className="web-browser-content"><small>{companyName || 'YOUR BUSINESS'}</small><h2>{es?'Una gran idea.\nUn nuevo comienzo.':'A great idea.\nA fresh start.'}</h2><p>{es?'Construí algo que importe.':'Build something that matters.'}</p><span className="web-mock-cta">{es?'Conocenos':'Discover more'} ↗</span><div className="web-mock-tiles"><i/><i/><i/></div></div></div>
      <div className="web-mobile"><div className="web-mobile-island"/><small>{companyName || 'YOUR BUSINESS'}</small><div className="web-mobile-orb"/><strong>{es?'Hola, mundo.':'Hello, world.'}</strong><div className="premium-paper-lines"/><span className="web-mock-cta">{es?'Empezar':'Get started'} ↗</span></div>
      <span className="web-preview-label">{es?'Vista ilustrativa':'Illustrative preview'}</span>
    </div>
    <div className="premium-grid">{items.map(([number,title,description])=><article className="premium-card web-feature" key={number}><span className="web-feature-number" aria-hidden="true">{number}</span><div className="premium-card-copy"><h2>{title}</h2><p>{description}</p></div></article>)}</div>
    <div className="premium-price"><span>{es?'Servicio web':'Website service'}</span><strong>$70<small>{es?'Pago único':'One-time payment'}</small></strong></div>
  </div>;
}
