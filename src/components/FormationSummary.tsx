'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { formatUsd, getFormationQuote } from '@/lib/formation';

export default function FormationSummary({ state, entity }: { state: string; entity: string }) {
  const { t } = useLanguage();
  const quote = getFormationQuote(state, entity);
  if (!quote) return null;
  return <div aria-live="polite" aria-atomic="true">
    <p className="t-h4" style={{ marginBottom: 20 }}>{entity} · {state}</p>

    <div className="summary-item"><span>{t('catalog.service')}</span><span>{formatUsd(quote.serviceFee)}</span></div>
    <div className="summary-item"><span>{t('catalog.stateFee')}</span><span>{formatUsd(quote.stateFee)}</span></div>
    <div className="summary-total"><span>{t('catalog.total')}</span><strong>{formatUsd(quote.total)}</strong></div>
    <p className="formation-note">{t('catalog.feeNote')}</p>
  </div>;
}
