import { NextResponse } from 'next/server';
import { normalizeDomain, DOMAIN_PRICE_USD } from '@/lib/domains';
import { checkDomain } from '@/lib/openprovider';
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const domain = normalizeDomain(body?.domain);
  if (!domain) return NextResponse.json({error:'invalid'}, {status:400});
  try {return NextResponse.json({...await checkDomain(domain),price:DOMAIN_PRICE_USD},{headers:{'Cache-Control':'no-store'}});}
  catch {return NextResponse.json({error:'unavailable'},{status:503});}
}
