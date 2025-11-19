import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export async function createCheckoutSession(params: {
  amount: number;
  donor_name?: string;
  donor_email: string;
  campaign_id?: string;
  is_anonymous?: boolean;
  success_url: string;
  cancel_url: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Hurricane Melissa Relief Fund',
            description: '100% of your donation goes directly to relief efforts',
          },
          unit_amount: Math.round(params.amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: params.success_url,
    cancel_url: params.cancel_url,
    customer_email: params.donor_email,
    metadata: {
      donor_name: params.donor_name || 'Anonymous',
      donor_email: params.donor_email,
      campaign_id: params.campaign_id || '',
      is_anonymous: params.is_anonymous ? 'true' : 'false',
    },
  });

  return session;
}
