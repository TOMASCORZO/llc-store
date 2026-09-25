'use client';

import { useState } from 'react';
import FormationSelector from '@/components/FormationSelector';
import PlanComparison from '@/components/PlanComparison';
import { DEFAULT_STATE, EntityType } from '@/lib/formation';
import { useLanguage } from '@/i18n/LanguageContext';

export default function ProductFormation() {
  const [entity, setEntity] = useState<EntityType>('LLC');
  const [state, setState] = useState(DEFAULT_STATE);
  const { t } = useLanguage();
  return <>
    <section className="product-hero">
      <div className="grid-bg product-grid" aria-hidden="true" />
      <div className="product-hero-inner">
        <h1 className="t-display" lang="en">Start from <span>0$</span></h1>
        <p className="product-subtitle" lang="en">just paying formations fees</p>
        <FormationSelector variant="product" entity={entity} state={state} onChange={(nextEntity, nextState) => { setEntity(nextEntity); setState(nextState); }} />
      </div>
    </section>
    <section className="product-plans" aria-labelledby="product-plans-heading">
      <h2 className="t-h3" id="product-plans-heading">{t('product.comparison')}</h2>
      <PlanComparison />
    </section>
  </>;
}
