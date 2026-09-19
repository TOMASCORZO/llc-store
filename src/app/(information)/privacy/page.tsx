import type { Metadata } from 'next';
import BusinessDetails from '@/components/BusinessDetails';

export const metadata: Metadata = { title: 'Privacy Policy | Just My LLC', description: 'How Just My LLC handles contact details, formation requests, service records and website storage.' };
export default function PrivacyPage() {
  return <>
    <h1>Privacy Policy</h1>
    <p className="information-intro">This policy explains the information used to review and provide our company formation services.</p>
    <h2>Who handles your information</h2><BusinessDetails />
    <p>Just My LLC handles information submitted through this website for reviewing service requests. Our support address is the contact point for privacy questions and requests once activated.</p>
    <h2>Information we collect</h2>
    <ul>
      <li>Review requests: name, email, optional phone number, proposed company name and suffix, entity type, state, LLC membership category, S Corp eligibility declaration and preferred language.</li>
      <li>Service records: request references, quoted fees, request status, correspondence and documents you authorize us to handle.</li>
      <li>Technical information: hosting and infrastructure services may process IP addresses, request timestamps, browser information and error or security logs.</li>
    </ul>
    <p>The current request form does not ask for identity documents, SSNs, bank login credentials or payment-card details and does not collect payments. If a later service step requires additional personal or ownership information, we will explain the purpose, required recipients and appropriate submission method before requesting it.</p>
    <h2>Why we use information</h2>
    <p>We use information to respond to inquiries, prepare quotes, check eligibility, carry out authorized services, provide support, prevent abuse and meet applicable recordkeeping or legal obligations. Where a legal basis is required, this may be taking steps at your request before a contract, performing a contract, complying with law, legitimate interests in secure operation and customer support, or consent where required. We do not use a review request as consent to marketing.</p>
    <h2>Sharing and service providers</h2>
    <p>When the request system is configured, records are stored using our database infrastructure provider, Supabase. Hosting, database and email providers process data needed to operate the service. Authorized formation and registered-agent providers, state agencies and the IRS may receive information required for a filing. Banks and payment platforms receive application information only as needed for the assistance you request and apply their own privacy policies.</p>
    <p>We may disclose information when legally required or necessary to address fraud or protect rights. We do not sell personal information. Some formation information may enter public government records; do not assume company registration makes all ownership information confidential.</p>
    <h2>Cookies, local storage and fonts</h2>
    <p>The website stores your language preference under <code>llc-lang</code> in browser local storage. You can change the language or clear site storage in your browser. The current application does not include advertising trackers or an analytics SDK. The site loads fonts from Google Fonts, which receives network information such as your IP address and browser headers when your browser requests them. See <a href="https://policies.google.com/privacy">Google’s Privacy Policy</a>.</p>
    <p>If we introduce optional analytics or marketing technologies, we will update this notice and obtain consent where required before activating them. External sites you visit have their own storage and privacy practices.</p>
    <h2>Retention, security and international processing</h2>
    <p>We retain information for as long as needed to handle your request, deliver agreed services, resolve disputes and comply with applicable recordkeeping duties. You may ask us to delete an abandoned request; we explain any reason we must retain a record. Access controls and restricted server credentials protect service records, but no system can guarantee absolute security.</p>
    <p>US formation services involve processing in the United States. Infrastructure and service providers may process data in other countries. Where transfer safeguards are required, we must use an applicable lawful mechanism before that transfer. Contact us for information about recipients or safeguards relevant to your request.</p>
    <h2>Your choices and rights</h2>
    <p>Depending on applicable law, you may request access, correction, deletion, restriction, portability or object to certain processing. You may withdraw consent where processing relies on consent, without affecting earlier lawful processing. Email <a href="mailto:support@justmyllc.com">support@justmyllc.com</a>; we may need to verify your identity appropriately. You may also complain to the data-protection authority applicable to you.</p>
    <p>The service is intended for adults. We do not knowingly solicit information from children. Contact us if a child has submitted information. Policy changes will be published on this page; material changes affecting an existing engagement will be communicated as required.</p>
  </>;
}
