'use client';

import { Suspense, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import FormationSelector from '@/components/FormationSelector';
import FormationSummary from '@/components/FormationSummary';
import { DEFAULT_STATE, EntityType, formatUsd, getFormationQuote } from '@/lib/formation';

function FormationCheckout() {
  const { t, lang } = useLanguage();
  const params = useSearchParams();
  const router = useRouter();
  const initialEntity: EntityType = params.get('entity') === 'S-Corp' ? 'S-Corp' : 'LLC';
  const initialState = params.get('state') || DEFAULT_STATE;
  const [entity, setEntity] = useState<EntityType>(initialEntity);
  const [state, setState] = useState(getFormationQuote(initialState, initialEntity) ? initialState : DEFAULT_STATE);
  const [eligible, setEligible] = useState(false);
  const [ownership, setOwnership] = useState('single');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const orderToken = useRef<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState({ customerName: '', customerEmail: '', customerPhone: '', llcName: '', designator: initialEntity === 'LLC' ? 'LLC' : 'Inc.' });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(false);
    try {
      if (!orderToken.current) {
        orderToken.current = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
      }
      const response = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderToken: orderToken.current, acceptTerms, ...formData, entity, state, sCorpEligible: eligible, ownership: entity === 'LLC' ? ownership : null, locale: lang }),
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

  return <main className="checkout-layout">
    <div className="checkout-form-side">
      <h1 className="t-h3">{t('catalog.request')}</h1>
      <p className="formation-note">{t('catalog.paymentNote')}</p>
      <p className="formation-note">{t('catalog.policyNotice')}</p>
      <nav className="policy-links" aria-label={t('footer.legal')}>
        <Link href="/terms">{t('footer.terms')}</Link>
        <Link href="/privacy">{t('footer.privacy')}</Link>
        <Link href="/refunds">{t('footer.refunds')}</Link>
        <Link href="/contact">{t('footer.contact')}</Link>
      </nav>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={isLoading} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <legend className="t-eyebrow">{t('catalog.choose')}</legend>
          <FormationSelector entity={entity} state={state} onChange={(nextEntity, nextState) => {
            setEntity(nextEntity); setState(nextState); setEligible(false);
            setFormData(data => ({ ...data, designator: nextEntity === 'LLC' ? 'LLC' : 'Inc.' }));
          }} />
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
          <h2 className="t-eyebrow" style={{ margin: '24px 0' }}>{t('catalog.information')}</h2>
          <div className="form-group"><label htmlFor="name">{t('catalog.name')}</label>
            <input id="name" autoComplete="name" required maxLength={200} value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group"><label htmlFor="email">{t('catalog.email')}</label>
              <input id="email" type="email" autoComplete="email" required maxLength={254} value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} />
            </div>
            <div className="form-group"><label htmlFor="phone">{t('catalog.phone')}</label>
              <input id="phone" type="tel" autoComplete="tel" maxLength={40} value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} />
            </div>
          </div>
          <div className="form-group"><label htmlFor="company">{t('catalog.company')}</label>
            <input id="company" required maxLength={200} value={formData.llcName} onChange={e => setFormData({ ...formData, llcName: e.target.value })} />
          </div>
          <div className="form-group"><label htmlFor="suffix">{t('catalog.suffix')}</label>
            <select id="suffix" value={formData.designator} onChange={e => setFormData({ ...formData, designator: e.target.value })}>
              {(entity === 'LLC' ? ['LLC', 'L.L.C.'] : ['Inc.', 'Corporation']).map(value => <option key={value}>{value}</option>)}
            </select>
          </div>
          <label className="formation-checkbox">
            <input type="checkbox" required checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} />
            <span>{t('catalog.acceptTerms')} <Link href="/terms" target="_blank">{t('footer.terms')}</Link>, <Link href="/privacy" target="_blank">{t('footer.privacy')}</Link>, <Link href="/refunds" target="_blank">{t('footer.refunds')}</Link>.</span>
          </label>
          {error && <p className="formation-error" role="alert">{t('catalog.error')} <a href="mailto:support@justmyllc.com">Email</a></p>}
          <button type="submit" className="btn btn-accent btn-xl" style={{ width: '100%', justifyContent: 'center' }} disabled={isLoading || !acceptTerms || (entity === 'S-Corp' && !eligible)}>
            {isLoading ? t('catalog.sending') : `${t('catalog.submit')} · ${formatUsd(getFormationQuote(state, entity)!.total)}`}
          </button>
        </fieldset>
      </form>
    </div>
    <aside className="checkout-summary-side"><div className="card" style={{ padding: 24 }}>
      <FormationSummary state={state} entity={entity} />
      <p className="formation-note">{t('pricing.desc')}</p>
      <ul className="pricing-features">{(t('pricing.features') as string[]).filter((_, i) => i !== 6 || entity === 'S-Corp').map(feature => <li key={feature}>{feature}</li>)}</ul>
      <p className="formation-note">{t('catalog.extras')}</p>
    </div></aside>
  </main>;
}

export default function CheckoutPage() {
  return <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
    <TopNav /><Suspense fallback={<main className="confirm-page">…</main>}><FormationCheckout /></Suspense><Footer />
  </div>;
}
