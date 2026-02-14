import Stripe from 'stripe';

export async function POST(request) {
  // If Stripe is not configured, return a message
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({
      error: 'Stripe not configured yet. Add STRIPE_SECRET_KEY to environment variables.',
      demo: true
    }, { status: 200 });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { lang = 'en' } = await request.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_PREMIUM, // Create this in Stripe dashboard: 9.99€/month
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/success?plan=premium&lang=${lang}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}?lang=${lang}`,
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return Response.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
