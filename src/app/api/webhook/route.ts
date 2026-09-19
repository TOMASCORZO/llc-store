import { NextResponse } from 'next/server';

// Enable payment updates only after implementing provider signature verification
// and checking the captured amount/currency against the server-side quote.
export async function POST() {
  return NextResponse.json({ error: 'Payment integration is not configured' }, { status: 503 });
}
