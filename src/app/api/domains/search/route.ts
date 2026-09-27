import { NextResponse } from 'next/server';
import { DOMAIN_EXTENSIONS } from '@/lib/domains';
import { checkDomains } from '@/lib/openprovider';
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.domain === 'string' ? body.domain.trim().toLowerCase().split('.')[0] : '';
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(name)) return NextResponse.json({error:'invalid'}, {status:400});
  const batch = body?.batch ?? 'initial';
  if (!['initial','remaining'].includes(batch)) return NextResponse.json({error:'invalid'}, {status:400});
  const extensions = batch === 'initial' ? DOMAIN_EXTENSIONS.slice(0,5) : DOMAIN_EXTENSIONS.slice(5);
  try {return NextResponse.json({results:await checkDomains(extensions.map(tld=>`${name}.${tld}`))},{headers:{'Cache-Control':'no-store'}});}
  catch {return NextResponse.json({error:'unavailable'},{status:503});}
}
