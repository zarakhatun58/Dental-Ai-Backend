import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Keep this in .env

export const createCheckoutSession = async (req, res) => {
  const { patient, service, amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: service,
            description: `Patient: ${patient}`,
          },
          unit_amount: Math.round(amount * 100), // amount in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://dentalai.pro/success',
      cancel_url: 'https://dentalai.pro/cancel',
    });

    res.json({ url: session.url }); // send URL to frontend
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Payment session creation failed' });
  }
};
