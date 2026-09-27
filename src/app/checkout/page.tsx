'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import OrderUpdatesConsent from '@/components/OrderUpdatesConsent';
import { SavedContact, readSavedContact, rememberRegisteredContact, forgetSavedContact } from '@/lib/saved-contact';
import { type DomainRegistration } from '@/lib/domains';
import DomainStep from '@/components/DomainStep';
import EinStep from '@/components/EinStep';
import RegisteredAgentStep from '@/components/RegisteredAgentStep';
import { EMPTY_AGENT, parseRegisteredAgent } from '@/lib/registered-agent';
import MembersStep from '@/components/MembersStep';
import { emptyMember, parseMembers, type Member } from '@/lib/members';
import PremiumPackage from '@/components/PremiumPackage';
import PlanComparison from '@/components/PlanComparison';
import BusinessMailStep from '@/components/BusinessMailStep';
import { EMPTY_BUSINESS_ADDRESS, parseBusinessMail, type BusinessAddress } from '@/lib/business-mail';
import ContactFields from '@/components/ContactFields';
import { ContactDetails } from '@/lib/contact';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import FormationSelector from '@/components/FormationSelector';
import StateFilingTime, { filingCopy } from '@/components/StateFilingTime';
import FormationSummary from '@/components/FormationSummary';
import { DEFAULT_STATE, EntityType, formatUsd, getFormationQuote, PlanId, isPlanId, includesEin, einServiceFee, PREMIUM_PACKAGE_USD } from '@/lib/formation';


const setupCopy = {
  en: { progress: 'Your progress', remaining: ['2 steps remaining', '1 step remaining', 'Final step'], steps: ['Company information', 'Your contact information', 'Review & payment'], back: 'Back', next: 'Next', summary: 'Order summary', help: 'Additional information', faq: [['What if my company name is unavailable?', 'The name entered here is a proposed name. Availability must be confirmed before filing.'], ['Should I include LLC or Inc. in the name?', 'Enter the company name without its ending, then choose the designator in the next field.']] },
  es: { progress: 'Tu progreso', remaining: ['Quedan 2 pasos', 'Queda 1 paso', 'Último paso'], steps: ['Información de la empresa', 'Tu información de contacto', 'Revisión y pago'], back: 'Atrás', next: 'Siguiente', summary: 'Resumen del pedido', help: 'Información adicional', faq: [['¿Qué pasa si el nombre no está disponible?', 'El nombre ingresado es una propuesta. Su disponibilidad debe confirmarse antes de presentar la constitución.'], ['¿Debo incluir LLC o Inc. en el nombre?', 'Ingresá el nombre sin la terminación y elegí el designador en el campo siguiente.']] },
  pt: { progress: 'Seu progresso', remaining: ['Faltam 2 etapas', 'Falta 1 etapa', 'Última etapa'], steps: ['Informações da empresa', 'Informações de contato', 'Revisão e pagamento'], back: 'Voltar', next: 'Próximo', summary: 'Resumo do pedido', help: 'Informações adicionais', faq: [['E se o nome estiver indisponível?', 'O nome é uma proposta. A disponibilidade deve ser confirmada antes do registro.'], ['Devo incluir LLC ou Inc. no nome?', 'Digite o nome sem a terminação e escolha o designador no campo seguinte.']] },
  fr: { progress: 'Votre progression', remaining: ['2 étapes restantes', '1 étape restante', 'Dernière étape'], steps: ['Informations de société', 'Vos coordonnées', 'Vérification et paiement'], back: 'Retour', next: 'Suivant', summary: 'Résumé de commande', help: 'Informations complémentaires', faq: [['Et si le nom est indisponible ?', 'Le nom saisi est une proposition. Sa disponibilité doit être confirmée avant le dépôt.'], ['Faut-il ajouter LLC ou Inc. au nom ?', 'Saisissez le nom sans suffixe, puis sélectionnez le suffixe dans le champ suivant.']] },
  de: { progress: 'Ihr Fortschritt', remaining: ['Noch 2 Schritte', 'Noch 1 Schritt', 'Letzter Schritt'], steps: ['Unternehmensdaten', 'Ihre Kontaktdaten', 'Prüfung und Zahlung'], back: 'Zurück', next: 'Weiter', summary: 'Bestellübersicht', help: 'Weitere Informationen', faq: [['Was, wenn der Name nicht verfügbar ist?', 'Der eingegebene Name ist ein Vorschlag. Die Verfügbarkeit muss vor der Einreichung bestätigt werden.'], ['Soll der Name LLC oder Inc. enthalten?', 'Geben Sie den Namen ohne Zusatz ein und wählen Sie den Zusatz im nächsten Feld.']] },
  zh: { progress: '您的进度', remaining: ['还剩2步', '还剩1步', '最后一步'], steps: ['公司信息', '您的联系信息', '核对与付款'], back: '返回', next: '下一步', summary: '订单摘要', help: '更多信息', faq: [['如果公司名称不可用怎么办？', '输入的名称是拟用名称，提交注册前需要确认是否可用。'], ['名称中应包含LLC或Inc.吗？', '请输入不带后缀的公司名称，然后在下一栏选择后缀。']] },
};

function FormationCheckout() {
  const { t, lang } = useLanguage();
  const baseCopy = setupCopy[lang];
  const mailTitle = { en: 'Business mailing address', es: 'Dirección comercial', pt: 'Endereço comercial', fr: 'Adresse professionnelle', de: 'Geschäftsadresse', zh: '公司地址' }[lang];
  const copy = { ...baseCopy, steps: [baseCopy.steps[0], filingCopy[lang].title, baseCopy.steps[1], mailTitle, lang === 'es' ? 'Paquete premium' : 'Premium Service Package', lang === 'es' ? 'Propietarios de la empresa' : 'Company owners', lang === 'es' ? 'Agente registrado' : 'Registered agent', 'EIN / Tax ID', lang === 'es' ? 'Dominio' : 'Domain', baseCopy.steps[2]], remaining: [{ en: '9 steps remaining', es: 'Quedan 9 pasos', pt: 'Faltam 9 etapas', fr: '9 étapes restantes', de: 'Noch 9 Schritte', zh: '还剩9步' }[lang], { en: '8 steps remaining', es: 'Quedan 8 pasos', pt: 'Faltam 8 etapas', fr: '8 étapes restantes', de: 'Noch 8 Schritte', zh: '还剩8步' }[lang], { en: '7 steps remaining', es: 'Quedan 7 pasos', pt: 'Faltam 7 etapas', fr: '7 étapes restantes', de: 'Noch 7 Schritte', zh: '还剩7步' }[lang], { en: '6 steps remaining', es: 'Quedan 6 pasos', pt: 'Faltam 6 etapas', fr: '6 étapes restantes', de: 'Noch 6 Schritte', zh: '还剩6步' }[lang], { en: '5 steps remaining', es: 'Quedan 5 pasos', pt: 'Faltam 5 etapas', fr: '5 étapes restantes', de: 'Noch 5 Schritte', zh: '还剩5步' }[lang], { en: '4 steps remaining', es: 'Quedan 4 pasos', pt: 'Faltam 4 etapas', fr: '4 étapes restantes', de: 'Noch 4 Schritte', zh: '还剩4步' }[lang], filingCopy[lang].remaining, ...baseCopy.remaining] };
  const [step, setStep] = useState(0);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { stepHeading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }, [step]);
  const params = useSearchParams();
  const router = useRouter();
  const requestedPlan = params.get('plan');
  const [plan, setPlan] = useState<PlanId>(isPlanId(requestedPlan) ? requestedPlan : 'standard');
  const [domainRegistration, setDomainRegistration] = useState<DomainRegistration | null>(null);
  const [einRequested, setEinRequested] = useState<boolean | null>(null);
  const [premiumPackage, setPremiumPackage] = useState(false);
  const skipEin = includesEin(plan) || premiumPackage;
  const visibleSteps = copy.steps.map((label, id) => ({ label, id })).filter(({ id }) => !skipEin || id !== 7);
  const progressIndex = visibleSteps.findIndex(({ id }) => id === step);
  const initialEntity: EntityType = params.get('entity') === 'S-Corp' ? 'S-Corp' : 'LLC';
  const initialState = params.get('state') || DEFAULT_STATE;
  const [entity, setEntity] = useState<EntityType>(initialEntity);
  const [state, setState] = useState(getFormationQuote(initialState, initialEntity) ? initialState : DEFAULT_STATE);
  const [contact, setContact] = useState<ContactDetails>({ firstName: '', lastName: '', country: '', street: '', addressLine2: '', city: '', region: '', postalCode: '' });
  const [mailChoice, setMailChoice] = useState<'own' | 'virtual'>('own');
  const [differentAddress, setDifferentAddress] = useState(false);
  const [businessAddress, setBusinessAddress] = useState<BusinessAddress>(EMPTY_BUSINESS_ADDRESS);
  const [mailError, setMailError] = useState(false);
  const businessMail = parseBusinessMail(mailChoice === 'virtual' ? { choice: 'virtual' } : { choice: 'own', address: differentAddress ? businessAddress : contact });
  const [savedContact, setSavedContact] = useState<SavedContact | null>(null);
  const [usingSavedContact, setUsingSavedContact] = useState(false);
  const [orderUpdatesConsent, setOrderUpdatesConsent] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [agent, setAgent] = useState(EMPTY_AGENT);
  const [agentError, setAgentError] = useState(false);
  const resolvedAgent = agent.useContactName && agent.type === 'individual' ? {...agent,firstName:contact.firstName,lastName:contact.lastName} : agent;
  const [members, setMembers] = useState<Member[]>([emptyMember()]);
  const [membersError, setMembersError] = useState(false);
  const resolvedMembers = members.map(member => member.useContactName && member.type === 'individual' ? {...member,firstName:contact.firstName,lastName:contact.lastName} : member);
  const ownership = members.length === 1 ? 'single' : 'multiple';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const orderToken = useRef<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState({ customerName: '', customerEmail: '', customerPhone: '', llcName: '', designator: initialEntity === 'LLC' ? 'LLC' : 'Inc.' });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (step < 9) {
      if (step === 3 && !businessMail) { setMailError(true); return; }
      if (step === 5 && !parseMembers(resolvedMembers, businessMail, entity)) { setMembersError(true); return; }
      if (step === 6 && !parseRegisteredAgent(resolvedAgent, state)) { setAgentError(true); return; }
      setAgentError(false);
      setMembersError(false);
      setMailError(false);
      if (step === 1) setSavedContact(readSavedContact());
      setStep(step === 6 && skipEin ? 8 : step + 1);
      return;
    }
    setIsLoading(true);
    setError(false);
    try {
      if (!orderToken.current) {
        orderToken.current = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
      }
      const response = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderToken: orderToken.current, acceptTerms, ...formData, customerName: `${contact.firstName.trim()} ${contact.lastName.trim()}`, contact, businessMail, members: resolvedMembers, registeredAgent: resolvedAgent, domainRegistration, einRequested: einRequested === true, plan, premiumPackage, orderUpdatesConsent, entity, state, sCorpEligible: eligible, ownership: entity === 'LLC' ? ownership : null, locale: lang }),
      });
      const data = await response.json();
      if (!response.ok || typeof data.orderId !== 'string') throw new Error('Request failed');
      rememberRegisteredContact(contact, formData.customerEmail, formData.customerPhone);
      sessionStorage.setItem(`order:${data.orderId}`, orderToken.current);
      const payment = await fetch('/api/orders/payment', { method: 'POST', headers: { Authorization: `Bearer ${orderToken.current}` } }).catch(() => null);
      const session = payment?.ok ? await payment.json().catch(() => null) : null;
      if (session?.url) window.location.assign(session.url);
      else router.push(`/checkout/confirmation?order=${encodeURIComponent(data.orderId)}&payment=unavailable`);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  return <>
    <header className="setup-header">
      <Link href="/" aria-label={t('nav.home')}><Logo size={24} /></Link>
      <nav className="setup-progress" aria-label={copy.progress}>
        <p className="setup-progress-caption" aria-live="polite">{copy.progress} · {progressIndex + 1}/{visibleSteps.length} <span>{copy.remaining[copy.steps.length - visibleSteps.length + progressIndex]}</span></p>
        <ol>{visibleSteps.map(({ label, id }, index) => <li key={label} className={id < step ? 'complete' : id === step ? 'current' : ''} aria-current={id === step ? 'step' : undefined}>
          <span className="setup-step-circle" aria-hidden="true">{id < step ? '✓' : index + 1}</span><span>{label}</span>
        </li>)}</ol>
      </nav>
      <Link href="/contact" className="setup-support">{t('footer.contact')}</Link>
    </header>
    <main className="setup-layout">
    <div>
      <section className="setup-form-card card">
      <h1 className="t-h3" tabIndex={-1} ref={stepHeading}>{copy.steps[step]}</h1>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={isLoading} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <legend className="sr-only">{copy.steps[step]}</legend>
          {step === 0 && <>
          <PlanComparison selected={plan} onSelect={setPlan} />
          <div className="form-row">
            <div className="form-group"><label htmlFor="company">{t('catalog.company')}</label>
              <input id="company" required pattern={".*\\S.*"} maxLength={200} autoComplete="organization" value={formData.llcName} onChange={e => setFormData({ ...formData, llcName: e.target.value })} />
            </div>
            <div className="form-group"><label htmlFor="suffix">{t('catalog.suffix')}</label>
              <select id="suffix" value={formData.designator} onChange={e => setFormData({ ...formData, designator: e.target.value })}>
                {(entity === 'LLC' ? ['LLC', 'L.L.C.'] : ['Inc.', 'Corporation']).map(value => <option key={value}>{value}</option>)}
              </select>
            </div>
          </div>
          </>}
          {step === 1 && <>
          <h2 className="t-eyebrow">{t('catalog.choose')}</h2>
          <FormationSelector entity={entity} state={state} onChange={(nextEntity, nextState) => {
            setEntity(nextEntity); setState(nextState); setEligible(false);
            setFormData(data => ({ ...data, designator: nextEntity === 'LLC' ? 'LLC' : 'Inc.' }));
          }} />
          <StateFilingTime state={state} entity={entity} />
          </>}
          {step === 2 && <>
          <ContactFields value={contact} onChange={value => { setContact(value); setUsingSavedContact(false); }} savedContactControl={savedContact && <div className="saved-contact">
            <label className="saved-contact-choice"><input type="checkbox" checked={usingSavedContact} onChange={event => {
              setUsingSavedContact(event.target.checked);
              if (event.target.checked) {
                setContact({ ...savedContact.contact });
                setFormData(data => ({ ...data, customerEmail: savedContact.email, customerPhone: savedContact.phone }));
              } else {
                setContact({ firstName: '', lastName: '', country: '', street: '', addressLine2: '', city: '', region: '', postalCode: '' });
                setFormData(data => ({ ...data, customerEmail: '', customerPhone: '' }));
              }
            }} /><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg><span>{savedContact.contact.firstName} {savedContact.contact.lastName}<small>{lang === 'es' ? 'Usar contacto guardado en este navegador' : 'Use contact saved in this browser'}</small></span></label>
            <button type="button" className="saved-contact-forget" onClick={() => { forgetSavedContact(); setSavedContact(null); setUsingSavedContact(false); }}>{lang === 'es' ? 'Olvidar' : 'Forget'}</button>
          </div>} />
          <div className="contact-channels">
          <div className="form-row">
            <div className="form-group"><label htmlFor="email">{t('catalog.email')}</label>
              <input id="email" type="email" autoComplete="email" required maxLength={254} value={formData.customerEmail} onChange={e => { setUsingSavedContact(false); setFormData({ ...formData, customerEmail: e.target.value }); }} />
            </div>
            <div className="form-group"><label htmlFor="phone">{t('catalog.phone')}</label>
              <input id="phone" required={orderUpdatesConsent} pattern={orderUpdatesConsent ? ".*\\S.*" : undefined} type="tel" autoComplete="tel" maxLength={40} value={formData.customerPhone} onChange={e => { setUsingSavedContact(false); setFormData({ ...formData, customerPhone: e.target.value }); }} />
            </div>
          </div>
          </div>
          {entity === 'S-Corp' && <label className="formation-checkbox">
            <input type="checkbox" checked={eligible} onChange={e => setEligible(e.target.checked)} required />
            <span>{t('catalog.confirmEligibility')}</span>
          </label>}
          <OrderUpdatesConsent checked={orderUpdatesConsent} onChange={setOrderUpdatesConsent} />
          </>}
          {step === 3 && <>
          <BusinessMailStep state={state} choice={mailChoice} onChoice={value => { setMailChoice(value); setMailError(false); }} different={differentAddress} onDifferent={value => { setDifferentAddress(value); setMailError(false); }} address={businessAddress} onAddress={value => { setBusinessAddress(value); setMailError(false); }} contact={contact} />
          {mailError && <p className="formation-error" role="alert">{lang === 'es' ? 'Ingresá una dirección física válida. Si tu dirección de contacto es un P.O. Box, elegí una dirección diferente. Para EE. UU., incluí el estado y un código ZIP válido.' : 'Enter a valid physical street address. If your contact address is a P.O. Box, choose a different address. US addresses need a state and valid ZIP code.'}</p>}
          </>}
          {step === 4 && <PremiumPackage entity={entity} einIncluded={includesEin(plan)} />}
          {step === 5 && <><MembersStep members={members} onChange={value=>{setMembers(value);setMembersError(false);}} contact={contact} businessMail={businessMail} entity={entity}/>{membersError && <p className="formation-error" role="alert">{lang === 'es' ? 'Revisá los nombres, el tipo de propietario y las direcciones de todos los miembros.' : 'Review the names, owner types, and addresses for every owner.'}</p>}</>}
          {step === 6 && <><RegisteredAgentStep value={agent} onChange={value=>{setAgent(value);setAgentError(false);}} contact={contact} state={state}/>{agentError && <p className="formation-error" role="alert">{lang === 'es' ? 'Revisá el nombre del agente, la dirección física y el código ZIP. No se permiten P.O. Boxes.' : 'Check the agent name, physical street address, and ZIP code. P.O. Boxes are not allowed.'}</p>}</>}
          {step === 7 && <EinStep companyName={`${formData.llcName} ${formData.designator}`} included={includesEin(plan) || premiumPackage} value={einRequested} onChange={setEinRequested} />}
          {step === 8 && <DomainStep companyName={formData.llcName} value={domainRegistration} onChange={setDomainRegistration} contact={contact} onContactChange={setContact} />}
          {step === 9 && <>
          <dl className="setup-review">{domainRegistration && <div><dt>{lang === 'es' ? 'Dominio · 1 año' : 'Domain · 1 year'}</dt><dd>{domainRegistration.name} · {formatUsd(domainRegistration.price || 0)}</dd></div>}<div><dt>EIN / Tax ID</dt><dd>{includesEin(plan) || premiumPackage ? (lang === 'es' ? 'Incluido' : 'Included') : einRequested ? formatUsd(50) : (lang === 'es' ? 'No seleccionado' : 'Not selected')}</dd></div><div><dt>{lang === 'es' ? 'Agente registrado' : 'Registered agent'}</dt><dd>{agent.choice === 'service' ? 'Just My LLC' : agent.type === 'company' ? agent.companyName : `${resolvedAgent.firstName} ${resolvedAgent.lastName}`}{agent.choice === 'own' && <><br/>{[agent.street,agent.addressLine2,agent.city,state,agent.postalCode].filter(Boolean).join(', ')}</>}</dd></div><div><dt>{lang === 'es' ? 'Propietarios' : 'Owners'}</dt><dd>{resolvedMembers.map(m=>m.type === 'company' ? m.companyName : `${m.firstName} ${m.lastName}`).join('; ')}</dd></div><div><dt>Plan</dt><dd>{formatUsd(getFormationQuote(state, entity, plan)!.serviceFee)}</dd></div><div><dt>{lang === 'es' ? 'Paquete premium' : 'Premium package'}</dt><dd>{premiumPackage ? formatUsd(PREMIUM_PACKAGE_USD) : (lang === 'es' ? 'No seleccionado' : 'Not selected')}</dd></div>
            <div><dt>{t('catalog.company')}</dt><dd>{formData.llcName} {formData.designator}</dd></div>
            <div><dt>{t('catalog.name')}</dt><dd>{contact.firstName} {contact.lastName}</dd></div>
            <div><dt>{lang === 'es' ? 'Dirección de contacto' : 'Contact address'}</dt><dd>{[contact.street, contact.addressLine2, contact.city, contact.region, contact.postalCode, contact.country].filter(Boolean).join(', ')}</dd></div>
            <div><dt>{mailTitle}</dt><dd>{businessMail?.choice === 'virtual' ? (lang === 'es' ? 'Dirección virtual solicitada — pendiente de confirmación' : 'Virtual address requested — awaiting confirmation') : businessMail?.choice === 'own' ? Object.values(businessMail.address).filter(Boolean).join(', ') : '—'}</dd></div>
            <div><dt>{t('catalog.email')}</dt><dd>{formData.customerEmail}</dd></div>
          </dl>
          <p className="formation-note">{t('catalog.paymentNote')}</p>
          <p className="formation-note">{t('catalog.policyNotice')}</p>
          <label className="formation-checkbox">
            <input type="checkbox" required checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} />
            <span>{t('catalog.acceptTerms')} <Link href="/terms" target="_blank">{t('footer.terms')}</Link>, <Link href="/privacy" target="_blank">{t('footer.privacy')}</Link>, <Link href="/refunds" target="_blank">{t('footer.refunds')}</Link>.</span>
          </label>
          </>}
          {error && <p className="formation-error" role="alert">{t('catalog.error')} <a href="mailto:support@justmyllc.com">Email</a></p>}
          <div className="setup-actions premium-actions">
            {step === 0 ? <Link href={`/product?entity=${encodeURIComponent(entity)}&state=${encodeURIComponent(state)}&plan=${plan}`} className="btn btn-outline">← {copy.back}</Link> : <button type="button" className="btn btn-outline" onClick={() => { setError(false); setStep(step === 8 && skipEin ? 6 : step - 1); }}>← {copy.back}</button>}
            {step === 4 ? <><button type="button" className="btn btn-outline" onClick={()=>{setPremiumPackage(false);setStep(5);}}>{lang === 'es' ? 'No, gracias' : 'No thanks'}</button><button type="button" className="btn btn-accent btn-xl" onClick={()=>{setPremiumPackage(true);setStep(5);}}>{lang === 'es' ? 'Agregar paquete · $99 →' : 'Add package · $99 →'}</button></> : <button type="submit" className="btn btn-accent btn-xl" disabled={isLoading || (step === 9 && (!acceptTerms || (entity === 'S-Corp' && !eligible)))}>
              {step < 9 ? `${copy.next} →` : isLoading ? t('catalog.sending') : `${t('catalog.submit')} · ${formatUsd(getFormationQuote(state, entity, plan)!.total + (premiumPackage ? PREMIUM_PACKAGE_USD : 0) + einServiceFee(plan, premiumPackage, einRequested === true) + (domainRegistration?.price || 0))}`}
            </button>}
          </div>
        </fieldset>
      </form>
      </section>
      {step === 5 && <section className="setup-help card"><h2 className="t-h4">{copy.help}</h2><details><summary>{lang === 'es' ? '¿Qué información de los propietarios aparece en los documentos de constitución?' : 'What owner information appears in formation documents?'}</summary><p>{lang === 'es' ? `Los datos exigidos y su publicación dependen del estado y del tipo de entidad. Confirmaremos qué nombres y direcciones deben incluirse para tu constitución en ${state}. Usar una dirección comercial no garantiza que todos los datos personales sean privados.` : `Required information and public disclosure depend on the state and entity type. We’ll confirm which names and addresses must be included for your ${state} formation. Using a business address does not guarantee that all personal information remains private.`}</p></details></section>}
      {step === 0 && <section className="setup-help card">
        <h2 className="t-h4">{copy.help}</h2>
        {copy.faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
      </section>}
    </div>
    <aside className="setup-summary"><div className="card" style={{ padding: 28 }}>
      <h2 className="t-h3 setup-summary-title">{copy.summary}</h2>
      <FormationSummary state={state} entity={entity} plan={plan} premiumPackage={premiumPackage} einRequested={einRequested === true} domainName={domainRegistration?.name} domainPrice={domainRegistration?.price} />
      {step >= 3 && <p className="formation-note">{mailChoice === 'virtual' ? (lang === 'es' ? 'Dirección virtual: solicitud pendiente de confirmación; sin cargo agregado hoy.' : 'Virtual address: request awaiting confirmation; no charge added today.') : (lang === 'es' ? 'Correspondencia: dirección propia.' : 'Business mail: own address.')}</p>}

      <ul className="pricing-features">{(t('pricing.features') as string[]).filter((_, i) => (i !== 6 || entity === 'S-Corp') && (i !== 2 || agent.choice === 'service') && (i !== 3 || includesEin(plan) || premiumPackage || einRequested)).map(feature => <li key={feature}>{feature}</li>)}</ul>
      <p className="formation-note">{t('catalog.extras')}</p>
    </div></aside>
  </main></>;
}

export default function CheckoutPage() {
  return <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
    <Suspense fallback={<main className="confirm-page">…</main>}><FormationCheckout /></Suspense><Footer />
  </div>;
}
