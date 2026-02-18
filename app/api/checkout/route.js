export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({
      error: 'Stripe not configured yet.',
      demo: true
    }, { status: 200 });
  }

  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { lang = 'en' } = await request.json();

    const baseUrl = 'https://sartoapp.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_PREMIUM,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${baseUrl}/success?plan=premium&lang=${lang}`,
      cancel_url: `${baseUrl}?lang=${lang}`,
      subscription_data: {
        trial_period_days: 7,
      },
      allow_promotion_codes: true,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return Response.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
