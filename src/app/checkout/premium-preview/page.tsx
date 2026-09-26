'use client';
import Link from 'next/link';
import { useState } from 'react';
import Logo from '@/components/Logo';
import PremiumPackage from '@/components/PremiumPackage';
import { useLanguage } from '@/i18n/LanguageContext';
export default function PremiumPreviewPage() {
  const { lang } = useLanguage();
  const es = lang === 'es';
  const [selection, setSelection] = useState<'accepted' | 'declined' | null>(null);
  return <div className="premium-preview-page">
    <header className="premium-preview-header"><Link href="/" aria-label="Just My LLC"><Logo size={24}/></Link><span>{es ? 'Vista previa del diseño' : 'Design preview'}</span></header>
    <main className="premium-preview-main"><section className="setup-form-card card">
      <h1 className="t-h3">{es ? 'Paquete de servicios premium' : 'Premium Service Package'}</h1>
      <PremiumPackage entity="LLC"/>
      {selection && <p className="premium-preview-feedback" role="status">{selection === 'accepted' ? (es ? 'Vista previa: seleccionaste el paquete premium. No se agregó ningún cargo.' : 'Preview: you selected the premium package. No charge was added.') : (es ? 'Vista previa: elegiste continuar sin el paquete.' : 'Preview: you chose to continue without the package.')}</p>}
      <div className="setup-actions premium-actions"><Link href="/checkout" className="btn btn-outline">← {es ? 'Atrás' : 'Back'}</Link><button type="button" className="btn btn-outline premium-skip" onClick={()=>setSelection('declined')}>{es ? 'No, gracias' : 'No thanks'}</button><button type="button" className="btn btn-accent btn-xl" onClick={()=>setSelection('accepted')}>{es ? 'Elegir paquete' : 'Get this package'} →</button></div>
      <p className="premium-preview-caption">{es ? 'Vista previa únicamente. Los botones no generan pedidos ni cobros.' : 'Preview only. These buttons do not create orders or charges.'}</p>
    </section></main>
  </div>;
}
