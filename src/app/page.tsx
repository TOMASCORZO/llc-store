'use client';

import React, { useState } from 'react';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import Link from 'next/link';
import FormationSelector from '@/components/FormationSelector';
import FormationSummary from '@/components/FormationSummary';
import { DEFAULT_STATE, EntityType } from '@/lib/formation';

function CheckIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}

export default function HomePage() {
    const { t } = useLanguage();
    const [entity, setEntity] = useState<EntityType>('LLC');
    const [state, setState] = useState(DEFAULT_STATE);
    const [openFaq, setOpenFaq] = useState<number | null>(1); // default open first

    return (
        <div>
            <TopNav />

            {/* ─── Hero Section ─────────────────────────────────────────── */}
            <section className="hero">
                <div className="grid-bg" style={{
                    position: 'absolute', inset: 0, opacity: 0.5,
                    maskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)',
                    pointerEvents: 'none',
                }} />
                
                <div className="hero-inner animate-fade-in">
                    <span className="hero-tagline tag tag-accent">
                        <span className="dot dot-blue" />
                        {t('hero.tagline')}
                    </span>
                    
                    <h1 className="t-display" style={{ whiteSpace: 'pre-wrap' }}>
                        <span style={{ color: 'var(--ink)' }}>{t('hero.title').split('\n')[0]}</span>
                        <br />
                        <span style={{ color: 'var(--accent)' }}>{t('hero.title').split('\n')[1]}</span>
                    </h1>
                    
                    <p className="t-body-lg">
                        {t('hero.subtitle')}
                    </p>
                    
                    <div className="hero-buttons">
                        <Link href="/checkout" className="btn btn-accent btn-xl">
                            {t('hero.cta')} <ArrowIcon />
                        </Link>
                        <a href="#includes" className="btn btn-outline btn-xl">
                            {t('hero.secondary')}
                        </a>
                    </div>
                    
                    <div className="hero-trust">
                        <span className="tag"><CheckIcon /> {t('hero.trust_llc')}</span>
                        <span className="tag"><CheckIcon /> {t('hero.trust_ein')}</span>
                        <span className="tag"><CheckIcon /> {t('hero.trust_bank')}</span>
                        <span className="tag"><CheckIcon /> {t('hero.trust_stripe')}</span>
                    </div>
                </div>
            </section>

            {/* ─── Includes / Grid ──────────────────────────────────────── */}
            <section id="includes" className="includes-section">
                <div className="includes-header">
                    <h2 className="t-h2" style={{ marginBottom: 16 }}>{t('includes.title')}</h2>
                    <p className="t-body-lg" style={{ maxWidth: 640, margin: '0 auto' }}>
                        {t('includes.description')}
                    </p>
                </div>
                
                <div className="includes-grid">
                    {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="include-card">
                            <div className="include-icon">
                                {num === 1 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>}
                                {num === 2 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
                                {num === 3 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
                                {num === 4 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>}
                            </div>
                            <h3>{t(`includes.items.${num}.title`)}</h3>
                            <p>{t(`includes.items.${num}.desc`)}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Process Bar ─────────────────────────────────────────── */}
            <section id="process" className="workflow-bar">
                <div className="t-eyebrow" style={{ textAlign: 'center', marginBottom: 24 }}>
                    {t('process.title')}
                </div>
                <div className="workflow-grid">
                    {[0, 1, 2, 3, 4].map((index) => {
                        const stepNames = t('process.steps');
                        const label = Array.isArray(stepNames) ? stepNames[index] : '';
                        return (
                            <div key={index} className="workflow-step">
                                {String(index + 1).padStart(2, '0')} / {label}
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="stats-band">
                <div className="stat-item"><div className="stat-value">50 + DC</div><div className="stat-label">{t('catalog.statesLabel')}</div></div>
                <div className="stat-item"><div className="stat-value">$50</div><div className="stat-label">{t('catalog.serviceLabel')}</div></div>
                <div className="stat-item"><div className="stat-value">101</div><div className="stat-label">{t('catalog.baseLabel')}</div></div>
                <div className="stat-item"><div className="stat-value">{t('catalog.agentValue')}</div><div className="stat-label">{t('catalog.agentLabel')}</div></div>
            </section>

            {/* ─── Pricing ─────────────────────────────────────────────── */}
            <section id="pricing" className="pricing-section">
                <div className="pricing-inner">
                    <h2 className="t-h2">{t('pricing.title')}</h2>
                    
                    <div className="card card-accent pricing-card center-card">
                        <span className="pricing-badge">Just My LLC</span>
                        <div className="pricing-amount">
                            <span className="currency">$</span>
                            <span className="price">{t('pricing.price')}</span>
                        </div>
                        <div className="pricing-amount" style={{ marginBottom: 16 }}>
                            <span className="unit">{t('pricing.unit')}</span>
                        </div>
                        
                        <p className="pricing-desc">{t('pricing.desc')}</p>
                        <FormationSelector entity={entity} state={state} onChange={(entity, state) => { setEntity(entity); setState(state); }} />
                        <FormationSummary entity={entity} state={state} />
                        
                        <ul className="pricing-features">
                            {t('pricing.features').filter((_, i) => i !== 6 || entity === 'S-Corp').map(feature => (
                                <li key={feature}><CheckIcon /><span>{feature}</span></li>
                            ))}
                        </ul>
                        
                        <p className="formation-note">{t('catalog.extras')}</p>
                        <Link href={`/checkout?entity=${entity}&state=${encodeURIComponent(state)}`} className="btn btn-accent btn-xl pricing-cta">
                            {t('pricing.cta')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── FAQ ─────────────────────────────────────────────────── */}
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

            {/* ─── Bottom CTA ──────────────────────────────────────────── */}
            <section className="cta-section">
                <div className="grid-bg" style={{
                    position: 'absolute', inset: 0, opacity: 0.4,
                    maskImage: 'radial-gradient(circle at center, black, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                
                <div className="cta-inner">
                    <h2 className="t-h1" style={{ marginBottom: 24 }}>
                        {t('catalog.choose')}
                    </h2>
                    
                    <Link href="/checkout" className="btn btn-accent btn-xl">
                        {t('hero.cta')}
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
