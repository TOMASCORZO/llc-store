'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        llcName: '',
        designator: 'LLC',
    });

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // 1. Create order record via API (Supabase)
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (data.orderId) {
                // 2. Initialize Cream Payment SDK with the Order ID
                // TODO: User needs to provide Cream credentials / SDK
                console.log("Initialize Cream for order: ", data.orderId);
                
                // Mocking successful payment and redirect for now
                setTimeout(() => {
                    window.location.href = `/checkout/confirmation?id=${data.orderId}`;
                }, 1500);
            }
        } catch (error) {
            console.error("Order creation failed", error);
            setIsLoading(false);
        }
    };

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <TopNav />
            
            <div className="checkout-layout">
                {/* Form Side */}
                <div className="checkout-form-side">
                    <div style={{ marginBottom: 32 }}>
                        <h1 className="t-h3" style={{ marginBottom: 8 }}>Secure Checkout</h1>
                        <p className="t-body-sm">Complete your information to start the formation process.</p>
                    </div>

                    <form onSubmit={handleFormSubmit}>
                        <div className="t-eyebrow" style={{ marginBottom: 16 }}>Owner Information</div>
                        
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                required
                                value={formData.customerName}
                                onChange={e => setFormData({...formData, customerName: e.target.value})}
                                placeholder="As it appears on your ID" 
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={formData.customerEmail}
                                    onChange={e => setFormData({...formData, customerEmail: e.target.value})}
                                    placeholder="For updates & documents" 
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input 
                                    type="tel" 
                                    required 
                                    value={formData.customerPhone}
                                    onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                                    placeholder="+1 234 567 8900" 
                                />
                            </div>
                        </div>

                        <div className="t-eyebrow" style={{ marginTop: 24, marginBottom: 16 }}>Company Details</div>
                        
                        <div className="form-row">
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Desired LLC Name</label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formData.llcName}
                                        onChange={e => setFormData({...formData, llcName: e.target.value})}
                                        style={{ flex: 1 }} 
                                        placeholder="e.g. Acme Global" 
                                    />
                                    <select 
                                        style={{ width: '120px' }}
                                        value={formData.designator}
                                        onChange={e => setFormData({...formData, designator: e.target.value})}
                                    >
                                        <option value="LLC">LLC</option>
                                        <option value="L.L.C.">L.L.C.</option>
                                    </select>
                                </div>
                                <p className="t-body-sm" style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-4)' }}>
                                    We will automatically check for name availability in New Mexico.
                                </p>
                            </div>
                        </div>

                        {/* Cream Payment Section placeholder */}
                        <div className="t-eyebrow" style={{ marginTop: 24, marginBottom: 16 }}>Payment (Powered by Cream)</div>
                        <div style={{ 
                            padding: 24, 
                            border: '1px solid var(--line-strong)', 
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--bg)',
                            marginBottom: 32,
                            textAlign: 'center'
                        }}>
                            {/* Cream UI would mount here */}
                            <p className="t-mono" style={{ color: 'var(--ink-4)', marginBottom: 16 }}>[ Cream Payment Widget ]</p>
                            
                            <button 
                                type="submit" 
                                className="btn btn-accent btn-xl" 
                                style={{ width: '100%', justifyContent: 'center' }}
                                disabled={isLoading}
                            >
                                {isLoading ? <div className="loading-spinner" /> : "Pay $102 with Cream"}
                            </button>
                        </div>
                        
                        <p className="t-body-sm" style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-4)' }}>
                            By proceeding, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
                        </p>
                    </form>
                </div>

                {/* Summary Side */}
                <div className="checkout-summary-side">
                    <div className="card" style={{ padding: 24 }}>
                        <h2 className="t-h4" style={{ marginBottom: 20 }}>Order Summary</h2>
                        
                        <div className="summary-item">
                            <div>
                                <div style={{ fontWeight: 500 }}>New Mexico LLC Formation</div>
                                <div className="t-body-sm">Includes state filing fees</div>
                            </div>
                            <div>$50.00</div>
                        </div>
                        
                        <div className="summary-item">
                            <div>
                                <div style={{ fontWeight: 500 }}>Registered Agent</div>
                                <div className="t-body-sm">First year included</div>
                            </div>
                            <div>$0.00</div>
                        </div>

                        <div className="summary-item">
                            <div>
                                <div style={{ fontWeight: 500 }}>EIN & Banking Setup</div>
                                <div className="t-body-sm">IRS & Stripe compliance</div>
                            </div>
                            <div>$52.00</div>
                        </div>

                        <div className="summary-total">
                            <div>Total Due</div>
                            <div style={{ fontSize: 24 }}>$102.00</div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginTop: 16 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <span className="t-body-sm" style={{ fontSize: 12 }}>
                                Secure 256-bit encrypted checkout. No hidden fees or recurring charges.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
}
