'use client';

import Link from 'next/link';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';

// A URL or query parameter is not evidence of a saved order or successful payment.
export default function ConfirmationPage() {
  const { t } = useLanguage();
  return <><TopNav /><main className="confirm-page"><div className="card confirm-card">
    <h1 className="t-h2">{t('catalog.request')}</h1>
    <p className="formation-note">{t('catalog.empty')}</p>
    <Link href="/checkout" className="btn btn-accent">{t('catalog.choose')}</Link>
  </div></main><Footer /></>;
}
