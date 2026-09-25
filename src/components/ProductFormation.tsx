'use client';

import { useState } from 'react';
import FormationSelector from '@/components/FormationSelector';
import PlanComparison from '@/components/PlanComparison';
import { DEFAULT_STATE, EntityType } from '@/lib/formation';
import { useLanguage } from '@/i18n/LanguageContext';

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function ProductFormation() {
  const [entity, setEntity] = useState<EntityType>('LLC');
  const [state, setState] = useState(DEFAULT_STATE);
  const [openFaq, setOpenFaq] = useState<number | null>(1);
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
    <section id="faq" className="faq-section">
      <div className="faq-inner">
        <div className="t-eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>
          {t('nav.faq')}
        </div>
        <h2 className="t-h2">{t('faq.title')}</h2>
        <div className="faq-list">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className={`faq-item ${openFaq === num ? 'open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === num ? null : num)}
                aria-expanded={openFaq === num}
              >
                {t(`faq.q${num}`)}
                <PlusIcon />
              </button>
              <div className="faq-answer">
                <p>{t(`faq.a${num}`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>;
}
