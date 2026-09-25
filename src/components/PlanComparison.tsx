'use client';

import { useLanguage } from '@/i18n/LanguageContext';

/** Shared, intentionally unfilled comparison for the home and product page. */
export default function PlanComparison() {
  const { t } = useLanguage();
  return <div className="plan-comparison">
    <table>
      <caption className="sr-only">{t('product.comparison')}</caption>
      <thead><tr>
        <th scope="col" className="plan-comparison-label">{t('product.packages')}</th>
        {[0, 50, 99].map((price, index) => <th scope="col" key={price}>
          <span className="plan-comparison-name">{t('product.plan')} {String(index + 1).padStart(2, '0')}</span>
          <span className="plan-comparison-price"><span>$</span>{price}</span>
        </th>)}
      </tr></thead>
      <tbody aria-hidden="true">{[0, 1, 2, 3].map(row => <tr key={row}><td /><td /><td /><td /></tr>)}</tbody>
    </table>
  </div>;
}
