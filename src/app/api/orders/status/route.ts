import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { tokenHash, validToken } from '@/lib/payments';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!validToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin.from('orders').select('id,status,amount_usd,entity_type,formation_state').eq('access_token_hash', tokenHash(token)).single();
  if (error || !data) return NextResponse.json({ error: 'Order unavailable' }, { status: 404 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
