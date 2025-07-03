import bodyParser from 'body-parser';
import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Use your actual Stripe secret key in .env

router.post('/checkout', async (req, res) => {
  try {
    const { patient, service, amount } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${service} for ${patient}`,
            },
            unit_amount: amount * 100, // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://your-frontend.com/success',
      cancel_url: 'https://your-frontend.com/cancel',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Something went wrong with Stripe' });
  }
});

// Must use raw body parser for Stripe webhooks
router.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = `${process.env.STRIPE_WEBHOOK_SECRET}`;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      return res.sendStatus(400);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('✅ Payment complete. Session:', session);

        // Update DB or perform logic here (e.g., mark transaction as completed)
        break;

      // Add more event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.sendStatus(200);
  }
);


export default router;
