import { business } from '@/lib/business';

export default function BusinessDetails() {
  return <div className="business-details">
    <p><strong>{business.brand}</strong> is the customer-facing brand for our company formation and administrative assistance service.</p>
    <p>Choose your formation, place your order and continue to secure payment when available. We collect the remaining documents and filing authorization after payment. An unpaid order does not begin a filing.</p>
    <p>Support email: <a href={`mailto:${business.email}`}>{business.email}</a></p>
  </div>;
}
