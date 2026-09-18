import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, customerPhone, llcName, designator } = body;

    // Validate inputs
    if (!customerName || !customerEmail || !llcName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert order into Supabase
    // Note: In development without active Supabase credentials, we mock the order ID
    // so the checkout flow can still be tested UI-wise
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log("Supabase not configured. Mocking order creation.");
      return NextResponse.json({ 
        orderId: `mock-order-${Math.floor(Math.random() * 10000)}`,
        status: 'pending_payment'
      });
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert([
        { 
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          llc_name: llcName,
          designator: designator || 'LLC',
          amount_usd: 102.00,
          status: 'pending_payment'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting order:', error);
      return NextResponse.json({ error: 'Failed to create order in database' }, { status: 500 });
    }

    return NextResponse.json({ 
      orderId: order.id,
      status: order.status
    });
    
  } catch (error) {
    console.error('API /orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
