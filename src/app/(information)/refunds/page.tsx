import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Refund & Cancellation Policy | Just My LLC', description: 'How to cancel a Just My LLC request, request a refund and handle filing charges or optional renewals.' };
export default function RefundsPage() {
  return <>
    <h1>Refund & Cancellation Policy</h1>
    <p className="information-intro">Contact us before a filing is submitted if you need to cancel or change your request.</p>
    <h2>Current review requests</h2>
    <p>The website currently collects review requests only. No payment is collected through this form, so cancelling a request does not require a refund. Email <a href="mailto:support@justmyllc.com">support@justmyllc.com</a> with your request reference and ask us to cancel.</p>
    <h2>Before paid work starts</h2>
    <p>For paid engagements accepted after launch, you may cancel before work begins for a full refund of payments we collected, provided no authorized filing or third-party charge has already been incurred. We will confirm the scope, payment terms and authorization to begin before performing paid work.</p>
    <h2>After work or filing starts</h2>
    <p>We refund the unperformed portion of our service and any unspent filing funds. Any deduction for work already performed must be explained and limited to the amount agreed in your written quote. State fees and third-party charges already submitted are refundable only to the extent the recipient returns them or applicable law requires otherwise. We provide an itemized explanation rather than treating every payment as automatically non-refundable.</p>
    <p>If we cannot provide the agreed service, we will explain what happened and refund unperformed work and unspent funds. If an error on our part affects delivery, contact us for correction or an appropriate refund. Mandatory remedies remain available.</p>
    <h2>Government, IRS, bank and platform outcomes</h2>
    <p>We cannot guarantee approval by a state agency, the IRS, a bank or a payment platform. A denial does not automatically reverse work already performed or filing charges already paid. It also does not remove your right to a refund for unperformed services or a remedy for a service that was not delivered as agreed. See the <Link href="/terms">Terms of Service</Link>.</p>
    <h2>How to request a refund</h2>
    <ol>
      <li>Email <a href="mailto:support@justmyllc.com">support@justmyllc.com</a> with your request reference, purchase email and a description of the issue.</li>
      <li>We aim to respond within three business days and explain the status, any additional information needed and any proposed deductions.</li>
      <li>Approved refunds are returned to the original payment method when available. We initiate them within ten business days of approval; your bank or payment provider may take additional time to post the credit.</li>
    </ol>
    <p>Never send card numbers, passwords, SSNs or identity documents with a refund email.</p>
    <h2>Renewals and optional services</h2>
    <p>Our US$50 formation service fee is one-time. Registered-agent and virtual-address services may have separate recurring charges if you enroll. Before enrollment, you receive the billing entity, renewal price, cancellation method and applicable terms. To request help cancelling, email support before the next renewal. Cancellation of a renewal does not dissolve a company or remove its obligation to maintain a registered agent.</p>
    <h2>Statutory rights</h2>
    <p>This policy does not restrict mandatory cancellation, withdrawal or refund rights under applicable law. Where early performance requires a separate request or acknowledgement, we obtain it before beginning. Merely submitting a review request does not waive such rights.</p>
  </>;
}
