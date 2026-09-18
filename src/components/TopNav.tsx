'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageCode } from '@/i18n/translations';

const LANGUAGES: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'zh', label: '中文' },
];

export default function TopNav() {
    const { t, lang, setLang } = useLanguage();
    const [langOpen, setLangOpen] = useState(false);

    return (
        <header className="top-nav">
            <div className="nav-left">
                <Link href="/" aria-label="Home" style={{ textDecoration: 'none' }}>
                    <Logo size={24} />
                </Link>
                <nav className="nav-links" aria-label="Primary">
                    <Link href="/#includes">{t('nav.features')}</Link>
                    <Link href="/#process">{t('nav.process')}</Link>
                    <Link href="/#pricing">{t('nav.pricing')}</Link>
                    <Link href="/#faq">{t('nav.faq')}</Link>
                </nav>
            </div>
            
            <div className="nav-actions">
                <div className="lang-switcher">
                    <button 
                        className="lang-btn" 
                        onClick={() => setLangOpen(!langOpen)}
                        onBlur={() => setTimeout(() => setLangOpen(false), 200)}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        {lang.toUpperCase()}
                    </button>
                    {langOpen && (
                        <div className="lang-dropdown">
                            {LANGUAGES.map(l => (
                                <button
                                    key={l.code}
                                    className={lang === l.code ? 'active' : ''}
                                    onClick={() => {
                                        setLang(l.code);
                                        setLangOpen(false);
                                    }}
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <Link href="/checkout" className="btn btn-accent btn-sm">
                    {t('nav.start')}
                </Link>
            </div>

            <details className="mobile-menu">
                <summary aria-label="Open navigation">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </summary>
                <div className="mobile-menu-panel">
                    <nav aria-label="Mobile primary navigation">
                        <Link href="/#includes">{t('nav.features')}</Link>
                        <Link href="/#process">{t('nav.process')}</Link>
                        <Link href="/#pricing">{t('nav.pricing')}</Link>
                        <Link href="/#faq">{t('nav.faq')}</Link>
                    </nav>
                    <div className="mobile-actions">
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                            {LANGUAGES.map(l => (
                                <button
                                    key={l.code}
                                    onClick={() => setLang(l.code)}
                                    style={{
                                        padding: '4px 8px', border: '1px solid var(--line)', background: lang === l.code ? 'var(--accent-soft)' : 'var(--bg)',
                                        color: lang === l.code ? 'var(--accent)' : 'var(--ink-2)', borderRadius: 4, fontSize: 12, cursor: 'pointer'
                                    }}
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                        <Link href="/checkout" className="btn btn-accent" style={{ justifyContent: 'center' }}>
                            {t('nav.start')}
                        </Link>
                    </div>
                </div>
            </details>
        </header>
    );
}
