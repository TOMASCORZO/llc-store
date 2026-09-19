import { business } from '@/lib/business';

export default function BusinessDetails() {
  return <div className="business-details">
    <p><strong>{business.brand}</strong> is the customer-facing brand for our company formation and administrative assistance service.</p>
    <p>We are preparing to launch. This website currently accepts review requests only; it does not collect payments. Email support is being configured before paid services become available.</p>
    <p>Support email: <a href={`mailto:${business.email}`}>{business.email}</a></p>
  </div>;
}
