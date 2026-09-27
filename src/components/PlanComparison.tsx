'use client';

import Link from 'next/link';
import { PLAN_PRICES, PlanId } from '@/lib/formation';
import { useLanguage } from '@/i18n/LanguageContext';

/** Shared, intentionally unfilled comparison for the home and product page. */
export default function PlanComparison({ selected, onSelect }: { selected?: PlanId; onSelect?: (plan: PlanId) => void }) {
  const { t, lang } = useLanguage();
  return <div className="plan-comparison">
    <table>
      <caption className="sr-only">{t('product.comparison')}</caption>
      <thead><tr>
        <th scope="col" className="plan-comparison-label">{t('product.packages')}</th>
        {(Object.entries(PLAN_PRICES) as [PlanId, number][]).map(([plan, price], index) => <th scope="col" key={plan} className={selected === plan ? 'plan-selected' : ''}>
          <span className="plan-comparison-name">{t('product.plan')} {String(index + 1).padStart(2, '0')}</span>
          <span className="plan-comparison-price"><span>$</span>{price}</span>
          {onSelect ? <button type="button" className="btn btn-outline plan-select" aria-pressed={selected === plan} onClick={()=>onSelect(plan)}>{selected === plan ? (lang === 'es' ? 'Seleccionado ✓' : 'Selected ✓') : (lang === 'es' ? 'Elegir plan' : 'Select plan')}</button> : <Link className="btn btn-outline plan-select" href={`/product?plan=${plan}`}>{lang === 'es' ? 'Elegir plan' : 'Select plan'}</Link>}
        </th>)}
      </tr></thead>
      <tbody><tr><th scope="row">EIN</th><td>{lang === 'es' ? 'No incluido' : 'Not included'}</td><td>✓</td><td>✓</td></tr>{[0, 1, 2].map(row => <tr key={row}><td /><td /><td /><td /></tr>)}</tbody>
    </table>
  </div>;
}
