import type { Metadata } from 'next';
import Link from 'next/link';
import BusinessDetails from '@/components/BusinessDetails';

export const metadata: Metadata = { title: 'Contact & Support | Just My LLC', description: 'Contact Just My LLC about formation orders, delivery, cancellations, refunds and privacy.' };
export default function ContactPage() {
  return <>
    <h1>Contact & Support</h1>
    <p className="information-intro">Questions about a formation order, documents or a cancellation? Contact Just My LLC directly.</p>
    <a className="btn btn-accent btn-xl" href="mailto:support@justmyllc.com">support@justmyllc.com</a>
    <p>We aim to respond within three business days. Include your order reference, selected state and entity type so we can find your order. For refunds, include your purchase email and a brief description of the issue.</p>
    <h2>Keep sensitive information out of email</h2>
    <p>Do not send passwords, full card numbers, SSNs, passport images or bank login credentials. If additional documents are required, we will explain the appropriate submission method.</p>
    <h2>Common requests</h2>
    <ul><li><Link href="/about">What the service includes and how delivery works</Link></li>
      <li><Link href="/#pricing">Prices by state and entity</Link></li>
      <li><Link href="/refunds">Cancellations, refunds and renewal assistance</Link></li>
      <li><Link href="/privacy">Privacy and requests about your data</Link></li></ul>
    <h2>Business information</h2><BusinessDetails />
  </>;
}
