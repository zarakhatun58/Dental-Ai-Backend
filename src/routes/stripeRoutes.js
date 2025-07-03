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
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("✅ Checkout completed:", session);

      // TODO: mark transaction as paid in your MySQL DB here
    }

    res.status(200).send();
  }
);

export default router;
