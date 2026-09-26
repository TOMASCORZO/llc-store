'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import ContactFields from '@/components/ContactFields';
import { ContactDetails } from '@/lib/contact';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import FormationSelector from '@/components/FormationSelector';
import StateFilingTime, { filingCopy } from '@/components/StateFilingTime';
import FormationSummary from '@/components/FormationSummary';
import { DEFAULT_STATE, EntityType, formatUsd, getFormationQuote } from '@/lib/formation';


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
  const copy = { ...baseCopy, steps: [baseCopy.steps[0], filingCopy[lang].title, ...baseCopy.steps.slice(1)], remaining: [filingCopy[lang].remaining, ...baseCopy.remaining] };
  const [step, setStep] = useState(0);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { stepHeading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }, [step]);
  const params = useSearchParams();
  const router = useRouter();
  const initialEntity: EntityType = params.get('entity') === 'S-Corp' ? 'S-Corp' : 'LLC';
  const initialState = params.get('state') || DEFAULT_STATE;
  const [entity, setEntity] = useState<EntityType>(initialEntity);
  const [state, setState] = useState(getFormationQuote(initialState, initialEntity) ? initialState : DEFAULT_STATE);
  const [contact, setContact] = useState<ContactDetails>({ firstName: '', lastName: '', country: '', street: '', addressLine2: '', city: '', region: '', postalCode: '' });
  const [eligible, setEligible] = useState(false);
  const [ownership, setOwnership] = useState('single');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const orderToken = useRef<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState({ customerName: '', customerEmail: '', customerPhone: '', llcName: '', designator: initialEntity === 'LLC' ? 'LLC' : 'Inc.' });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (step < 3) {
      setStep(step + 1);
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
        body: JSON.stringify({ orderToken: orderToken.current, acceptTerms, ...formData, customerName: `${contact.firstName.trim()} ${contact.lastName.trim()}`, contact, entity, state, sCorpEligible: eligible, ownership: entity === 'LLC' ? ownership : null, locale: lang }),
      });
      const data = await response.json();
      if (!response.ok || typeof data.orderId !== 'string') throw new Error('Request failed');
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
        <p className="setup-progress-caption" aria-live="polite">{copy.progress} · {step + 1}/{copy.steps.length} <span>{copy.remaining[step]}</span></p>
        <ol>{copy.steps.map((label, index) => <li key={label} className={index < step ? 'complete' : index === step ? 'current' : ''} aria-current={index === step ? 'step' : undefined}>
          <span className="setup-step-circle" aria-hidden="true">{index < step ? '✓' : index + 1}</span><span>{label}</span>
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
          <ContactFields value={contact} onChange={setContact} />
          <div className="contact-channels">
          <div className="form-row">
            <div className="form-group"><label htmlFor="email">{t('catalog.email')}</label>
              <input id="email" type="email" autoComplete="email" required maxLength={254} value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} />
            </div>
            <div className="form-group"><label htmlFor="phone">{t('catalog.phone')}</label>
              <input id="phone" type="tel" autoComplete="tel" maxLength={40} value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} />
            </div>
          </div>
          </div>
          {entity === 'LLC' && <div className="form-group">
            <label htmlFor="ownership">{t('catalog.ownership')}</label>
            <select id="ownership" value={ownership} onChange={e => setOwnership(e.target.value)}>
              <option value="single">{t('catalog.single')}</option><option value="multiple">{t('catalog.multiple')}</option>
            </select>
          </div>}
          {entity === 'S-Corp' && <label className="formation-checkbox">
            <input type="checkbox" checked={eligible} onChange={e => setEligible(e.target.checked)} required />
            <span>{t('catalog.confirmEligibility')}</span>
          </label>}
          </>}
          {step === 3 && <>
          <dl className="setup-review">
            <div><dt>{t('catalog.company')}</dt><dd>{formData.llcName} {formData.designator}</dd></div>
            <div><dt>{t('catalog.name')}</dt><dd>{contact.firstName} {contact.lastName}</dd></div>
            <div><dt>{lang === 'es' ? 'Dirección de contacto' : 'Contact address'}</dt><dd>{[contact.street, contact.addressLine2, contact.city, contact.region, contact.postalCode, contact.country].filter(Boolean).join(', ')}</dd></div>
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
          <div className="setup-actions">
            {step === 0 ? <Link href={`/product?entity=${encodeURIComponent(entity)}&state=${encodeURIComponent(state)}`} className="btn btn-outline">← {copy.back}</Link> : <button type="button" className="btn btn-outline" onClick={() => { setError(false); setStep(step - 1); }}>← {copy.back}</button>}
            <button type="submit" className="btn btn-accent btn-xl" disabled={isLoading || (step === 3 && (!acceptTerms || (entity === 'S-Corp' && !eligible)))}>
              {step < 3 ? `${copy.next} →` : isLoading ? t('catalog.sending') : `${t('catalog.submit')} · ${formatUsd(getFormationQuote(state, entity)!.total)}`}
            </button>
          </div>
        </fieldset>
      </form>
      </section>
      {step === 0 && <section className="setup-help card">
        <h2 className="t-h4">{copy.help}</h2>
        {copy.faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
      </section>}
    </div>
    <aside className="setup-summary"><div className="card" style={{ padding: 28 }}>
      <h2 className="t-h3 setup-summary-title">{copy.summary}</h2>
      <FormationSummary state={state} entity={entity} />
      <p className="formation-note">{t('pricing.desc')}</p>
      <ul className="pricing-features">{(t('pricing.features') as string[]).filter((_, i) => i !== 6 || entity === 'S-Corp').map(feature => <li key={feature}>{feature}</li>)}</ul>
      <p className="formation-note">{t('catalog.extras')}</p>
    </div></aside>
  </main></>;
}

export default function CheckoutPage() {
  return <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
    <Suspense fallback={<main className="confirm-page">…</main>}><FormationCheckout /></Suspense><Footer />
  </div>;
}
