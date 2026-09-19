import Link from 'next/link';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';

export default function InformationLayout({ children }: { children: React.ReactNode }) {
  return <><TopNav /><main className="information-page" lang="en">
    <nav className="information-nav" aria-label="Company and policies">
      <Link href="/about">About & service delivery</Link><Link href="/contact">Contact</Link>
      <Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/refunds">Refunds & cancellation</Link>
    </nav>
    <p className="t-eyebrow">Just My LLC · Information in English</p>
    <article className="information-content">{children}</article>
  </main><Footer /></>;
}
