'use client';

import { Suspense, useEffect, useState } from 'react';
import EmbeddedPayment from '@/components/EmbeddedPayment';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';

type Order = { payment_total_cents?: number | null; payment_tax_cents?: number | null; payment_fee_cents?: number | null; id: string; status: string; amount_usd: number; entity_type: string; formation_state: string; domain_status?: string; domain_name?: string };
function OrderStatus() {
  const { t, lang } = useLanguage();
  const params = useSearchParams();
  const id = params.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState(params.get('payment') === 'unavailable');
  const [paying, setPaying] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  async function pay() {
    if (!id) return;
    setPaying(true); setPaymentError(false);
    try {
      const token = sessionStorage.getItem(`order:${id}`);
      const response = await fetch('/api/orders/payment', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error('Payment unavailable');
      if (data.complete) setRefreshVersion(value => value + 1);
      else if (typeof data.clientSecret === 'string') setClientSecret(data.clientSecret);
      else throw new Error('Payment unavailable');
      setPaying(false);
    } catch { setPaymentError(true); setPaying(false); }
  }
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    async function refresh() {
      try {
        const token = id && sessionStorage.getItem(`order:${id}`);
        if (!token) return;
        const response = await fetch('/api/orders/status', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Order unavailable');
        const data = await response.json();
        if (stopped || data.id !== id) return;
        setOrder(data);
        if ((data.status === 'pending_payment' || ['pending_payment','registering','requested'].includes(data.domain_status)) && attempts++ < 20) timer = setTimeout(refresh, 3000);
      } catch { /* Never infer payment from a URL or a provider redirect. */ }
      finally { if (!stopped) setLoading(false); }
    }
    void refresh();
    return () => { stopped = true; clearTimeout(timer); };
  }, [id, refreshVersion]);
  const paid = order && ['paid', 'processing', 'completed'].includes(order.status);
  return <main className="confirm-page"><div className="card confirm-card" aria-live="polite">
    <h1 className="t-h2">{loading ? t('catalog.loading') : paid ? t('catalog.paid') : order ? t('catalog.received') : t('catalog.request')}</h1>
    {!loading && <>
      <p className="formation-note">{paid ? t('catalog.paidBody') : order ? t('catalog.receivedBody') : t('catalog.empty')}</p>
      {order && <><p>{t('catalog.reference')}: {order.id}</p><p>{order.entity_type} · {order.formation_state} · US${(paid && order.payment_total_cents != null ? order.payment_total_cents / 100 : Number(order.amount_usd)).toFixed(2)}</p><p>{t('catalog.status')}: {t(`catalog.statuses.${order.status}`)}</p></>}
      {order && <p className="formation-note">{paid && order.payment_tax_cents != null ? `${lang === 'es' ? 'Impuestos incluidos' : 'Tax included'}: US$${(order.payment_tax_cents / 100).toFixed(2)}` : (lang === 'es' ? 'Subtotal antes de impuestos. Stripe mostrará el total final antes de pagar.' : 'Subtotal before tax. Stripe will show the final total before payment.')}</p>}
      {params.get('payment') === 'canceled' && !paid && <p className="formation-note">{lang === 'es' ? 'Volviste sin completar el pago. Podés retomarlo con el botón de abajo.' : 'You returned without completing payment. You can resume using the button below.'}</p>}
      {order?.domain_name && <p>{order.domain_name}: {order.domain_status === 'registered' ? (lang === 'es' ? 'Registrado' : 'Registered') : order.domain_status === 'needs_review' ? (lang === 'es' ? 'Requiere revisión. Contactá a soporte con tu referencia de pedido.' : 'Needs review. Contact support with your order reference.') : (lang === 'es' ? 'Registro pendiente de confirmación' : 'Registration awaiting confirmation')}</p>}
      {order?.status === 'pending_payment' && !clientSecret && <button className="btn btn-accent" disabled={paying} onClick={pay}>{paying ? t('catalog.sending') : t('catalog.submit')}</button>}
      {clientSecret && !paid && <EmbeddedPayment clientSecret={clientSecret} es={lang === 'es'} onComplete={() => { setClientSecret(null); setRefreshVersion(value => value + 1); }} />}
      {paymentError && !paid && <p className="formation-error" role="alert">{t('catalog.paymentUnavailable')}</p>}
      <p className="formation-note">{t('catalog.contact')} <a href="mailto:support@justmyllc.com">support@justmyllc.com</a></p>
      <Link href={order ? '/' : '/checkout'} className="btn btn-outline">{order ? t('catalog.home') : t('catalog.choose')}</Link>
    </>}
  </div></main>;
}
export default function ConfirmationPage() {
  return <><TopNav /><Suspense fallback={<main className="confirm-page">…</main>}><OrderStatus /></Suspense><Footer /></>;
}
