'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="footer">
            <div className="footer-grid">
                <div>
                    <Logo />
                    <p className="t-body-sm" style={{ marginTop: 16, maxWidth: 280 }}>
                        {t('footer.desc')}
                    </p>
                    <div className="footer-tags">
                        <span className="tag">LLC & S Corp</span>
                        <span className="tag">Remote Setup</span>
                        <span className="tag">Just My LLC</span>
                    </div>
                </div>
                
                <div className="footer-col">
                    <div className="footer-col-title">{t('footer.product')}</div>
                    <ul>
                        <li><Link href="/#includes">{t('nav.features')}</Link></li>
                        <li><Link href="/#process">{t('nav.process')}</Link></li>
                        <li><Link href="/#pricing">{t('nav.pricing')}</Link></li>
                        <li><Link href="/checkout">{t('nav.start')}</Link></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <div className="footer-col-title">{t('footer.company')}</div>
                    <ul>
                        <li><Link href="/#faq">{t('nav.faq')}</Link></li>
                        <li><Link href="/about">{t('footer.about')}</Link></li>
                        <li><Link href="/contact">{t('footer.contact')}</Link></li>
                        <li><a href="mailto:support@justmyllc.com">support@justmyllc.com</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <div className="footer-col-title">{t('footer.legal')}</div>
                    <ul>
                        <li><Link href="/terms">{t('footer.terms')}</Link></li>
                        <li><Link href="/privacy">{t('footer.privacy')}</Link></li>
                        <li><Link href="/refunds">{t('footer.refunds')}</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} Just My LLC. All rights reserved.</span>
            </div>
        </footer>
    );
}
