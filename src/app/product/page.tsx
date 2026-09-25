import type { Metadata } from 'next';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import ProductFormation from '@/components/ProductFormation';

export const metadata: Metadata = {
  title: 'Start from 0$ — Just My LLC',
  description: 'Choose your entity and state. Compare Just My LLC formation plans starting from $0 plus formation fees.',
};

export default function ProductPage() {
  return <><TopNav /><main><ProductFormation /></main><Footer /></>;
}
