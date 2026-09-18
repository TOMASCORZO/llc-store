import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// This is a placeholder webhook endpoint for Cream payments.
// When Cream processes a payment, it should POST to this endpoint.

export async function POST(request: Request) {
  try {
    // 1. Verify Cream webhook signature
    // const signature = request.headers.get('cream-signature');
    // if (!verifyCreamSignature(await request.text(), signature)) {
    //    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const body = await request.json();
    
    // 2. Extract order info and payment status from Cream payload
    const { orderId, paymentStatus, paymentId } = body;

    console.log(`Webhook received for order ${orderId}, status: ${paymentStatus}`);

    if (paymentStatus === 'PAID') {
      // 3. Update the order in Supabase
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { error } = await supabaseAdmin
          .from('orders')
          .update({ 
            status: 'paid',
            cream_payment_id: paymentId
          })
          .eq('id', orderId);

        if (error) {
          console.error("Failed to update order status:", error);
          return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
