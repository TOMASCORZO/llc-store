import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { tokenHash, validToken } from '@/lib/payments';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!validToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin.from('orders').select('id,status,amount_usd,entity_type,formation_state,domain_status,domain_registration,payment_total_cents,payment_tax_cents,payment_fee_cents').eq('access_token_hash', tokenHash(token)).single();
  if (error || !data) return NextResponse.json({ error: 'Order unavailable' }, { status: 404 });
  const {domain_registration, ...safeOrder} = data;
  return NextResponse.json({...safeOrder,domain_name:domain_registration?.name || null}, { headers: { 'Cache-Control': 'no-store' } });
}
