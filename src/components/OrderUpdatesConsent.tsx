'use client';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';

export default function OrderUpdatesConsent({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  const { lang, t } = useLanguage();
  const es = lang === 'es';
  return <div className="order-updates-notice" lang={es ? 'es' : 'en'}>
    <label className="order-updates-label" htmlFor="order-updates-consent">
      <input id="order-updates-consent" type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} aria-describedby="order-updates-description" />
      <span>{es ? 'Quiero recibir actualizaciones por SMS y llamadas de Just My LLC sobre mi pedido.' : 'I’d like to receive SMS updates and calls about my order from Just My LLC.'}</span>
    </label>
    <p id="order-updates-description">{es ? 'Al marcar esta casilla, autorizás a Just My LLC a contactarte por SMS y llamadas sobre tu pedido. La frecuencia puede variar y pueden aplicarse cargos de mensajes y datos. Es opcional y no es necesario para comprar. Podés retirar tu consentimiento contactando a ' : 'By checking this box, you agree to receive SMS messages and calls from Just My LLC about your order. Frequency may vary. Message and data rates may apply. This is optional and is not required to purchase. You can withdraw consent by contacting '}<a href="mailto:support@justmyllc.com">support@justmyllc.com</a>. <Link href="/privacy" target="_blank" rel="noopener noreferrer">{t('footer.privacy')}</Link>.</p>
  </div>;
}
