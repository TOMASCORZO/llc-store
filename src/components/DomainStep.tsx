'use client';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { type DomainResult, type DomainRegistration } from '@/lib/domains';
import { formatUsd } from '@/lib/formation';
import type { ContactDetails } from '@/lib/contact';
export default function DomainStep({companyName,value,onChange,contact,onContactChange}:{companyName:string;value:DomainRegistration|null;onChange:(value:DomainRegistration|null)=>void;contact:ContactDetails;onContactChange:(contact:ContactDetails)=>void}) {
  const {lang}=useLanguage(); const es=lang==='es';
  const suggested=companyName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,63);
  const [domain,setDomain]=useState(suggested || 'mybusiness');
  const [query,setQuery]=useState({name:suggested || 'mybusiness',attempt:0});
  const [results,setResults]=useState<DomainResult[]>([]);
  const [page,setPage]=useState(1);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  const [moreStatus,setMoreStatus]=useState<'loading'|'ready'|'error'>('loading');
  useEffect(()=>{
    const controller=new AbortController();
    async function fetchBatch(batch:string) {
      const response=await fetch('/api/domains/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({domain:query.name,batch}),signal:controller.signal});
      if(!response.ok) throw new Error();
      return (await response.json()).results as DomainResult[];
    }
    async function load() {
      let initial:DomainResult[];
      try {
        initial=await fetchBatch('initial');
        if(controller.signal.aborted)return;
        setResults(initial);setStatus('ready');
      } catch {if(!controller.signal.aborted)setStatus('error');return;}
      try {
        const remaining=await fetchBatch('remaining');
        if(!controller.signal.aborted){setResults([...initial,...remaining]);setMoreStatus('ready');}
      } catch {if(!controller.signal.aborted)setMoreStatus('error');}
    }
    void load();
    return ()=>controller.abort();
  },[query]);
  function search() { onChange(null);setPage(1);setStatus('loading');setMoreStatus('loading');setQuery({name:domain,attempt:query.attempt+1}); }
  const field=(key:'street'|'number'|'phoneCountry'|'phoneArea'|'phoneNumber',label:string,placeholder:string,pattern?:string)=><div className="form-group"><label htmlFor={`domain-${key}`}>{label}</label><input id={`domain-${key}`} required pattern={pattern||'.*\\S.*'} placeholder={placeholder} value={value?.[key]||''} maxLength={key==='street'?200:key==='number'?20:key==='phoneCountry'?4:key==='phoneArea'?8:15} onChange={e=>value&&onChange({...value,[key]:e.target.value})}/></div>;
  return <section><h2 className="t-h4">{es?'Dale a tu empresa su propio dominio':'Give your business its own domain'}</h2><p className="contact-intro">{es?'Empezá con un dominio inspirado en el nombre de tu empresa.':'Start with a domain inspired by your company name.'}</p><div className="ein-included"><span aria-hidden="true">!</span><div><strong>{es?'Asegurá el nombre antes de presentar tu LLC':'Secure your name before filing your LLC'}</strong><p>{es?'El nombre de tu LLC puede aparecer en registros públicos. Constituirla no reserva su dominio: otra persona podría registrarlo mientras siga disponible.':'Your LLC name may appear in public records. Forming it does not reserve its domain: someone else could register it while it remains available.'}</p></div></div><div className="domain-search"><div className="form-group"><label htmlFor="domain-search">{es?'Nombre del dominio':'Domain name'}</label><input id="domain-search" value={domain} onChange={e=>setDomain(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();search();}}} autoCapitalize="none" spellCheck={false}/></div><button type="button" className="btn btn-accent" onClick={search}>{es?'Buscar dominios':'Search domains'}</button></div>
    <p className="formation-note">{es?'Precios por el primer año. Sin renovación automática.':'First-year prices. No automatic renewal.'}</p>
    {status==='loading' && <div className="domain-loading" role="status" aria-live="polite"><span className="domain-spinner" aria-hidden="true"/><h3>{es?'Buscando tu próximo dominio…':'Finding your next domain…'}</h3><p>{es?'Estamos comprobando disponibilidad y precios de los primeros 5 dominios.':'Checking availability and prices for the first 5 domains.'}</p><div className="domain-skeleton"/><div className="domain-skeleton"/><div className="domain-skeleton"/></div>}
    {status==='error' && <p role="alert">{es?'No pudimos consultar los dominios. Probá de nuevo o continuá sin dominio.':'We couldn’t check domains. Try again or continue without a domain.'}</p>}
    {status==='ready' && <><ul className="domain-results">{results.slice((page-1)*5,page*5).map(result=>{
      const selectable=result.available && !result.premium && result.price!==null;
      return <li key={result.name} className={value?.name===result.name?'selected':''}><div><strong>{result.name}</strong><small>{!result.available?(es?'No disponible':'Unavailable'):result.premium?(es?'Dominio premium — consultar':'Premium domain — contact us'):result.price===null?(es?'Precio no confirmado':'Price unconfirmed'):(es?'Disponible':'Available')}</small></div><div className="domain-result-action">{selectable && <span><strong>{formatUsd(result.price!)}</strong><small>{es?'1 año':'1 year'}</small></span>}<button type="button" className="btn btn-outline" disabled={!selectable} aria-pressed={value?.name===result.name} onClick={()=>onChange(value?.name===result.name?null:{name:result.name,price:result.price!,street:contact.street,number:'',phoneCountry:'',phoneArea:'',phoneNumber:'',consent:true})}>{value?.name===result.name?(es?'Quitar':'Remove'):(es?'Agregar':'Add')}</button></div></li>;
    })}</ul><nav className="domain-pagination" aria-label={es?'Páginas de dominios':'Domain result pages'}>{Array.from({length:3},(_,i)=><button key={i} type="button" disabled={i*5>=results.length} className="btn btn-outline" aria-current={page===i+1?'page':undefined} onClick={()=>setPage(i+1)}>{i+1}</button>)}</nav>{moreStatus==='loading' && <p className="formation-note" role="status">{es?'Cargando más opciones…':'Loading more options…'}</p>}{moreStatus==='error' && <p className="formation-note" role="status">{es?'No se pudieron cargar las otras opciones. Los primeros resultados siguen disponibles.':'More options could not be loaded. The first results are still available.'}</p>}</>}
    {value && <div style={{marginTop:28}}><p className="t-h4">{value.name} · {formatUsd(value.price || 0)}</p><h3 className="t-h4">{es?'Titular del dominio':'Domain registrant'}: {contact.firstName} {contact.lastName}</h3><p className="formation-note">{es?'Usaremos tu nombre, correo y dirección de contacto para registrarlo a tu nombre. Confirmá la calle, el número y el teléfono internacional.':'We’ll use your contact name, email and address to register it in your name. Confirm your street, building number and international phone number.'}</p><div className="form-row">{field('street',es?'Calle (sin número)':'Street (without number)','')}{field('number',es?'Número':'Building number','')}</div><div className="form-group"><label htmlFor="domain-postcode">{es?'Código postal':'Postal code'}</label><input id="domain-postcode" required pattern=".*\S.*" maxLength={20} value={contact.postalCode} onChange={e=>onContactChange({...contact,postalCode:e.target.value})}/></div><div className="form-row">{field('phoneCountry',es?'Código de país':'Country calling code','+1','\\+[1-9][0-9]{0,2}')}{field('phoneArea',es?'Código de área':'Area code','305','[0-9]{1,8}')}{field('phoneNumber',es?'Número local':'Local phone number','5550123','[0-9]{3,15}')}</div><p className="formation-note">{es?'Al continuar, autorizás el registro por un año mediante Openprovider y el envío de estos datos al registrador. La disponibilidad se confirma al registrar después del pago. Si falla, revisaremos el pedido y te contactaremos.':'By continuing, you authorize one year of registration through Openprovider and sharing these details with the registrar. Availability is confirmed during registration after payment. If it fails, we’ll review your order and contact you.'}</p></div>}
    {!value && <p className="formation-note">{es?'Podés continuar sin agregar un dominio. La búsqueda no lo reserva.':'You can continue without a domain. Searching does not reserve it.'}</p>}
  </section>;
}
