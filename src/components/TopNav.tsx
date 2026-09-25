'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageCode } from '@/i18n/translations';

const LANGUAGES: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' }, { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' }, { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' }, { code: 'zh', label: '中文' },
];
const serviceLinks = [['/product', 'product.navigation'], ['/#includes', 'nav.features'], ['/#process', 'nav.process'], ['/#pricing', 'nav.pricing'], ['/#faq', 'nav.faq']];
const companyLinks = [['/about', 'footer.about'], ['/contact', 'footer.contact']];
const policyLinks = [['/terms', 'footer.terms'], ['/privacy', 'footer.privacy'], ['/refunds', 'footer.refunds']];

export default function TopNav() {
    const { t, lang, setLang } = useLanguage();
    const pathname = usePathname();
    const header = useRef<HTMLElement>(null);
    const closeMenus = () => header.current?.querySelectorAll('details[open]').forEach(menu => menu.removeAttribute('open'));

    useEffect(() => {
        const outside = (event: PointerEvent) => {
            if (!header.current?.contains(event.target as Node)) closeMenus();
        };
        const escape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            const open = header.current?.querySelector<HTMLDetailsElement>('details[open]');
            if (open) { closeMenus(); open.querySelector('summary')?.focus(); }
        };
        document.addEventListener('pointerdown', outside);
        document.addEventListener('keydown', escape);
        return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
    }, []);

    function links(items: string[][]) {
        return items.map(([href, key]) => <Link key={href} href={href} onClick={closeMenus} aria-current={pathname === href ? 'page' : undefined}>{t(key)}</Link>);
    }
    const languages = <label className="nav-language"><span className="sr-only">{t('nav.language')}</span>
        <select value={lang} onChange={event => setLang(event.target.value as LanguageCode)}>
            {LANGUAGES.map(language => <option key={language.code} value={language.code}>{language.label}</option>)}
        </select>
    </label>;

    return <header className="top-nav" ref={header}>
        <div className="nav-left">
            <Link href="/" aria-label={t('nav.home')} onClick={closeMenus} className="nav-brand"><Logo size={24} /></Link>
            <nav className="nav-links" aria-label={t('nav.navigation')}>
                {links(serviceLinks)}
                <details className="nav-information" onBlur={event => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false;
                }}>
                    <summary className={companyLinks.concat(policyLinks).some(([href]) => href === pathname) ? 'active' : ''}>{t('nav.information')}<span className="nav-chevron" aria-hidden="true">⌄</span></summary>
                    <div className="nav-information-panel">
                        <div className="nav-link-group"><span className="t-eyebrow">{t('footer.company')}</span>{links(companyLinks)}</div>
                        <div className="nav-link-group"><span className="t-eyebrow">{t('footer.legal')}</span>{links(policyLinks)}</div>
                    </div>
                </details>
            </nav>
        </div>
        <div className="nav-actions">{languages}<Link href="/checkout" className="btn btn-accent btn-sm">{t('nav.start')}</Link></div>
        <details className="mobile-menu">
            <summary aria-label={t('nav.navigation')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg></summary>
            <div className="mobile-menu-panel">
                <nav aria-label={t('nav.navigation')}>
                    <div className="nav-link-group"><span className="t-eyebrow">{t('footer.product')}</span>{links(serviceLinks)}</div>
                    <div className="nav-link-group"><span className="t-eyebrow">{t('footer.company')}</span>{links(companyLinks)}</div>
                    <div className="nav-link-group"><span className="t-eyebrow">{t('footer.legal')}</span>{links(policyLinks)}</div>
                </nav>
                <div className="mobile-actions">{languages}<Link href="/checkout" onClick={closeMenus} className="btn btn-accent">{t('nav.start')}</Link></div>
            </div>
        </details>
    </header>;
}
