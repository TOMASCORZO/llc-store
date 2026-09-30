'use client';

import { useEffect, useRef, useState } from 'react';
import { loadStripe, type StripeEmbeddedCheckout } from '@stripe/stripe-js';

export default function EmbeddedPayment({ clientSecret, es, onComplete }: { clientSecret: string; es: boolean; onComplete: () => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const completion = useRef(onComplete);
  useEffect(() => { completion.current = onComplete; }, [onComplete]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let canceled = false;
    let checkout: StripeEmbeddedCheckout | undefined;
    async function initialize() {
      try {
        const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!key) throw new Error('Payments unavailable');
        const stripe = await loadStripe(key);
        if (canceled) return;
        if (!stripe) throw new Error('Unable to load Stripe');
        const instance = await stripe.createEmbeddedCheckoutPage({ clientSecret, onComplete: () => { if (!canceled) completion.current(); } });
        if (canceled) { instance.destroy(); return; }
        checkout = instance;
        if (!mount.current) { instance.destroy(); return; }
        instance.mount(mount.current);
        setStatus('ready');
      } catch { if (!canceled) setStatus('error'); }
    }
    void initialize();
    return () => { canceled = true; checkout?.destroy(); };
  }, [clientSecret, attempt]);
  return <section className="embedded-payment" aria-label={es ? 'Pago seguro con tarjeta' : 'Secure card payment'}>
    <h2 className="t-h3">{es ? 'Pagá con tarjeta' : 'Pay by card'}</h2>
    <p className="formation-note">{es ? 'Ingresá tu tarjeta aquí. Stripe procesa el pago de forma segura y muestra los impuestos y el total antes de confirmar.' : 'Enter your card here. Stripe securely processes your payment and shows taxes and the final total before you confirm.'}</p>
    {status === 'loading' && <p role="status">{es ? 'Cargando formulario seguro…' : 'Loading secure payment form…'}</p>}
    {status === 'error' && <div role="alert"><p>{es ? 'No pudimos cargar el formulario de pago. Tu pedido sigue guardado; podés volver a intentarlo.' : 'We could not load the payment form. Your order is saved; you can try again.'}</p><button className="btn btn-outline" type="button" onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }}>{es ? 'Reintentar' : 'Try again'}</button></div>}
    <div ref={mount} />
  </section>;
}
