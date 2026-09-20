'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';

type Order = { id: string; status: string; amount_usd: number; entity_type: string; formation_state: string };
function OrderStatus() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const id = params.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState(params.get('payment') === 'unavailable');
  const [paying, setPaying] = useState(false);
  async function pay() {
    if (!id) return;
    setPaying(true); setPaymentError(false);
    try {
      const token = sessionStorage.getItem(`order:${id}`);
      const response = await fetch('/api/orders/payment', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error('Payment unavailable');
      window.location.assign(data.url);
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
        if (data.status === 'pending_payment' && attempts++ < 20) timer = setTimeout(refresh, 3000);
      } catch { /* Never infer payment from a URL or a provider redirect. */ }
      finally { if (!stopped) setLoading(false); }
    }
    void refresh();
    return () => { stopped = true; clearTimeout(timer); };
  }, [id]);
  const paid = order && ['paid', 'processing', 'completed'].includes(order.status);
  return <main className="confirm-page"><div className="card confirm-card" aria-live="polite">
    <h1 className="t-h2">{loading ? t('catalog.loading') : paid ? t('catalog.paid') : order ? t('catalog.received') : t('catalog.request')}</h1>
    {!loading && <>
      <p className="formation-note">{paid ? t('catalog.paidBody') : order ? t('catalog.receivedBody') : t('catalog.empty')}</p>
      {order && <><p>{t('catalog.reference')}: {order.id}</p><p>{order.entity_type} · {order.formation_state} · US${Number(order.amount_usd).toFixed(2)}</p><p>{t('catalog.status')}: {t(`catalog.statuses.${order.status}`)}</p></>}
      {order?.status === 'pending_payment' && <button className="btn btn-accent" disabled={paying} onClick={pay}>{paying ? t('catalog.sending') : t('catalog.submit')}</button>}
      {paymentError && !paid && <p className="formation-error" role="alert">{t('catalog.paymentUnavailable')}</p>}
      <p className="formation-note">{t('catalog.contact')} <a href="mailto:support@justmyllc.com">support@justmyllc.com</a></p>
      <Link href={order ? '/' : '/checkout'} className="btn btn-outline">{order ? t('catalog.home') : t('catalog.choose')}</Link>
    </>}
  </div></main>;
}
export default function ConfirmationPage() {
  return <><TopNav /><Suspense fallback={<main className="confirm-page">…</main>}><OrderStatus /></Suspense><Footer /></>;
}
