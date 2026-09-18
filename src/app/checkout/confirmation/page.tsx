'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';

function OrderStatus() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');
    
    return (
        <>
            {orderId && (
                <div style={{ 
                    background: 'var(--bg-sunken)', 
                    padding: 12, 
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--ink-4)',
                    marginTop: 24,
                    marginBottom: 24
                }}>
                    Order ID: {orderId}
                </div>
            )}
        </>
    );
}

export default function ConfirmationPage() {
    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <TopNav />
            
            <main className="confirm-page">
                <div className="card confirm-card animate-fade-in">
                    <div className="confirm-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    
                    <h1 className="t-h2" style={{ marginBottom: 12 }}>Payment Successful!</h1>
                    <p className="t-body-lg">
                        We've received your order and are starting the LLC formation process.
                    </p>
                    
                    <Suspense fallback={<div style={{ height: 60 }} />}>
                        <OrderStatus />
                    </Suspense>
                    
                    <div className="confirm-steps">
                        <div className="t-eyebrow" style={{ color: 'var(--accent)' }}>Next Steps</div>
                        
                        <div className="confirm-step">
                            <div className="confirm-step-num">1</div>
                            <div>
                                <div style={{ fontWeight: 500 }}>Name Verification</div>
                                <div className="t-body-sm">We are verifying your LLC name with the state of New Mexico (1-2 business days).</div>
                            </div>
                        </div>
                        
                        <div className="confirm-step">
                            <div className="confirm-step-num" style={{ background: 'var(--bg-sunken)', color: 'var(--ink-3)' }}>2</div>
                            <div>
                                <div style={{ fontWeight: 500, color: 'var(--ink-3)' }}>State Filing</div>
                                <div className="t-body-sm">Filing the Articles of Organization with the state.</div>
                            </div>
                        </div>
                        
                        <div className="confirm-step">
                            <div className="confirm-step-num" style={{ background: 'var(--bg-sunken)', color: 'var(--ink-3)' }}>3</div>
                            <div>
                                <div style={{ fontWeight: 500, color: 'var(--ink-3)' }}>EIN & Banking</div>
                                <div className="t-body-sm">Requesting your EIN from the IRS and preparing bank documents.</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--line)' }}>
                        <p className="t-body-sm" style={{ marginBottom: 24 }}>
                            A receipt and welcome packet has been sent to your email address. 
                            Our compliance team will reach out if we need any additional information.
                        </p>
                        <Link href="/" className="btn btn-outline">
                            Return Home
                        </Link>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
