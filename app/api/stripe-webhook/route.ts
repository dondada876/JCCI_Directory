import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Calculate fees (Stripe takes 2.9% + $0.30)
        const amount = (session.amount_total || 0) / 100;
        const transactionFee = amount * 0.029 + 0.30;
        const netAmount = amount - transactionFee;

        // Create donation record
        const { error } = await supabase.from('donations').insert({
          donor_name: session.metadata?.donor_name || 'Anonymous',
          donor_email: session.metadata?.donor_email || session.customer_email,
          is_anonymous: session.metadata?.is_anonymous === 'true',
          amount: amount,
          currency: session.currency?.toUpperCase() || 'USD',
          payment_method: 'stripe',
          stripe_payment_id: session.payment_intent as string,
          transaction_fee: transactionFee,
          net_amount: netAmount,
          campaign_id: session.metadata?.campaign_id || null,
          designated_use: 'hurricane_melissa',
          allocation_status: 'unallocated',
        });

        if (error) {
          console.error('Error creating donation record:', error);
        }

        // TODO: Send tax receipt email
        // TODO: Trigger N8N workflow for receipt generation

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', paymentIntent.id);
        // TODO: Notify donor of failed payment
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}
