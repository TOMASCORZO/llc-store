import type { Metadata } from 'next';
import Link from 'next/link';
import BusinessDetails from '@/components/BusinessDetails';

export const metadata: Metadata = { title: 'Terms of Service | Just My LLC', description: 'Scope, pricing, responsibilities and service terms for Just My LLC formation, EIN and banking assistance.' };

export default function TermsPage() {
  return <>
    <h1>Terms of Service</h1>
    <p className="information-intro">Please read these terms before requesting company formation, EIN or banking assistance.</p>
    <h2>1. Who we are and current availability</h2>
    <BusinessDetails />
    <p>Submitting a review request does not create a company, authorize a filing or make a payment. A paid engagement starts only after we confirm availability, provide the contracting details and a final written quote, and you accept the scope and payment terms.</p>
    <h2>2. What the service includes</h2>
    <p>We coordinate preparation and submission of US formation documents through specialist service providers. Just My LLC provides EIN application assistance and assistance with a US business bank account. The selected package includes the first year of registered-agent service and access to formation documents. For S Corp formation, the scope includes the federal Form 2553 election for eligible businesses.</p>
    <p>We provide administrative assistance. We are not a government agency, bank or payment processor. The service does not include legal representation, individualized tax advice, tax-return preparation or ongoing accounting. Obtain qualified advice when choosing a state or tax treatment. A third-party introductory tax consultation is not an ongoing advisory engagement.</p>
    <h2>3. Pricing and additional costs</h2>
    <p>Our one-time service fee is US$50, including EIN and banking assistance. State filing charges are additional and shown separately in the <Link href="/#pricing">price estimate</Link>. Your final quote may depend on company details and filing requirements. We obtain your agreement before charging for changes or optional work.</p>
    <p>Taxes, publication requirements, reports, licenses, expedited processing, operating agreements, bylaws and optional subscriptions are excluded unless expressly included in your written quote. Registered-agent service currently renews at US$149 per year after the included first year. Optional virtual-address service currently offers a promotional first month, then US$29 per month if retained. We explain the provider, billing and cancellation terms before you enroll. Our US$50 service fee itself is not a subscription.</p>
    <h2>4. Your responsibilities and eligibility</h2>
    <p>You must be an adult authorized to act for the proposed company, provide accurate information, review documents before authorizing submission and respond to requests for necessary information. Do not use the service for unlawful activity, false filings, impersonation or evasion of ownership-disclosure requirements.</p>
    <p>S Corp tax status has eligibility requirements, including restrictions on nonresident alien shareholders, a maximum of 100 eligible shareholders and one class of stock. A checkbox is an initial declaration, not a tax determination. State availability and eligibility are reviewed before filing.</p>
    <h2>5. Delivery and third-party decisions</h2>
    <p>Work begins after the agreed payment, required documents and filing authorization are received. We communicate the expected timeline and deliver available documents electronically. State agencies, the IRS, banks and payment platforms control their processing and approval decisions. We cannot guarantee a name, formation date, EIN issuance date, bank account, Stripe account or tax outcome. See <Link href="/about">service delivery</Link>.</p>
    <h2>6. Cancellations, errors and refunds</h2>
    <p>Our <Link href="/refunds">Refund & Cancellation Policy</Link> explains cancellation before work begins, work already performed and third-party charges. Notify us promptly if information or documents are incorrect. We will review the issue and explain available corrections; additional charges require your agreement. Nothing in these terms excludes rights or remedies that applicable law makes mandatory.</p>
    <h2>7. Privacy and communications</h2>
    <p>We use information to review and fulfill your request and communicate about it as explained in the <Link href="/privacy">Privacy Policy</Link>. Contact <a href="mailto:support@justmyllc.com">support@justmyllc.com</a> for assistance or a complaint. Do not email passwords, payment-card details or identity documents.</p>
    <h2>8. Changes and disputes</h2>
    <p>We may update these terms for future requests. Changes do not retroactively alter an accepted quote without your agreement. Contact us first so we can try to resolve a concern. These terms do not impose mandatory arbitration, waive statutory consumer rights or limit access to a competent court or regulator.</p>
  </>;
}
