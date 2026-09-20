import type { Metadata } from 'next';
import Link from 'next/link';
import BusinessDetails from '@/components/BusinessDetails';

export const metadata: Metadata = { title: 'About & Service Delivery | Just My LLC', description: 'Understand our US formation service, EIN and bank application assistance, deliverables and timelines.' };
export default function AboutPage() {
  return <>
    <h1>About Just My LLC</h1>
    <p className="information-intro">Administrative support for US company formation, EIN applications and business bank account applications.</p>
    <p>We coordinate formation through specialist providers and guide customers through the information and documents needed for their chosen service. This is an assisted service, not an instant software download. We do not sell pre-approved bank accounts or access to payment accounts.</p>
    <h2>What you receive</h2>
    <ul><li>Coordination of formation-document preparation and submission in the selected state.</li>
      <li>First-year registered-agent service and electronic access to available formation documents.</li>
      <li>EIN application assistance provided by Just My LLC.</li>
      <li>Assistance preparing a US business bank account application. The bank retains the approval decision.</li>
      <li>For eligible S Corp formations, coordination of the Form 2553 tax election.</li></ul>
    <p>LLC formation is available in all 50 states and Washington, DC. Our S Corp formation service is available except in Louisiana. Specialized entities and individual eligibility require review. <Link href="/#pricing">See formation prices</Link>: US$50 service fee plus state filing charges, with optional services quoted separately.</p>
    <h2>How delivery works</h2>
    <ol><li><strong>Order and pay.</strong> Choose your entity and state, enter your contact and company details, accept the policies and continue to secure payment. No prior inquiry or manual quote is required for the listed formations.</li>
      <li><strong>Complete your formation details.</strong> After payment confirmation, we contact you for the ownership information, documents and authorization needed to file. We check eligibility and explain expected timing.</li>
      <li><strong>Prepare and file.</strong> Once the required information and filing authorization are complete, we coordinate preparation and submission. Payment alone does not mean your company has been formed.</li>
      <li><strong>Receive documents.</strong> We provide status updates and access to available formation and EIN documents electronically. We explain any separate account or document-delivery instructions.</li>
      <li><strong>Banking assistance.</strong> We help prepare the bank application after the required company documents are available. You remain responsible for the bank’s identity checks and application decisions.</li></ol>
    <h2>Timing and limitations</h2>
    <p>There is no single guaranteed delivery time. State and IRS processing, completeness of customer information and bank review determine the schedule. We communicate an expected timeline for your order before filing, and explain material delays when known. No physical shipping is included.</p>
    <p>We are not a law firm, bank, tax authority or payment platform. Formation does not guarantee tax savings, eligibility for S Corp status, or approval for banking or Stripe. Ongoing taxes, reports, licenses, registered-agent renewals and accounting remain the company’s responsibility unless separately agreed.</p>
    <h2>Who operates the service</h2><BusinessDetails />
    <p>Read our <Link href="/terms">Terms</Link>, <Link href="/privacy">Privacy Policy</Link> and <Link href="/refunds">Refund & Cancellation Policy</Link>, or <Link href="/contact">contact support</Link>.</p>
  </>;
}
