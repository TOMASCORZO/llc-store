'use client';
import { DOMAIN_PRICE_USD } from '@/lib/domains';

import { useLanguage } from '@/i18n/LanguageContext';
import { formatUsd, getFormationQuote, PlanId, einServiceFee, PREMIUM_PACKAGE_USD } from '@/lib/formation';

export default function FormationSummary({ state, entity, plan = 'standard', premiumPackage = false, einRequested = false, domainName }: { state: string; entity: string; plan?: PlanId; premiumPackage?: boolean; einRequested?: boolean; domainName?: string }) {
  const { t, lang } = useLanguage();
  const quote = getFormationQuote(state, entity, plan);
  if (!quote) return null;
  return <div aria-live="polite" aria-atomic="true">
    <p className="t-h4" style={{ marginBottom: 20 }}>{entity} · {state}</p>

    <div className="summary-item"><span>{lang === 'es' ? 'Plan de constitución' : 'Formation plan'}</span><span>{formatUsd(quote.serviceFee)}</span></div>
    <div className="summary-item"><span>{t('catalog.stateFee')}</span><span>{formatUsd(quote.stateFee)}</span></div>
    {premiumPackage && <div className="summary-item"><span>{lang === 'es' ? 'Paquete premium' : 'Premium package'}</span><span>{formatUsd(PREMIUM_PACKAGE_USD)}</span></div>}
    {einServiceFee(plan, premiumPackage, einRequested) > 0 && <div className="summary-item"><span>EIN / Tax ID</span><span>{formatUsd(einServiceFee(plan, premiumPackage, einRequested) + (domainName ? DOMAIN_PRICE_USD : 0))}</span></div>}
    {domainName && <div className="summary-item"><span>{domainName} · {lang === 'es' ? '1 año' : '1 year'}</span><span>{formatUsd(DOMAIN_PRICE_USD)}</span></div>}
    <div className="summary-total"><span>{t('catalog.total')}</span><strong>{formatUsd(quote.total + (premiumPackage ? PREMIUM_PACKAGE_USD : 0) + einServiceFee(plan, premiumPackage, einRequested) + (domainName ? DOMAIN_PRICE_USD : 0))}</strong></div>
    <p className="formation-note">{t('catalog.feeNote')}</p>
  </div>;
}
