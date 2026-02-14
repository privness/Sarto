import Stripe from 'stripe';

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ received: true });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('New Premium subscriber:', event.data.object.customer_email);
        // TODO: Store subscriber in database when ready
        break;
      case 'customer.subscription.deleted':
        console.log('Subscription cancelled:', event.data.object.id);
        break;
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return Response.json({ error: 'Webhook failed' }, { status: 400 });
  }
}
