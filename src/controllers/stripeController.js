// src/controllers/stripeController.js
import Stripe from 'stripe';
import pool from '../config/db.js'; // If using MySQL for saving transactions

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Create a Stripe Checkout session
export const createCheckoutSession = async (req, res) => {
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
            unit_amount: parseFloat(amount) * 100, // Amount in cents
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
    console.error('Stripe Checkout error:', err.message);
    res.status(500).json({ error: 'Something went wrong with Stripe' });
  }
};

// Stripe webhook handler
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('✅ Payment succeeded. Saving transaction...');

    const { customer_email, amount_total, metadata } = session;

    try {
      // Save transaction in DB if needed
      await pool.query(
        `INSERT INTO transactions (patient, service, amount, method, status, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          metadata?.patient || customer_email || 'Unknown',
          metadata?.service || 'Unknown',
          amount_total / 100,
          'Card',
          'completed',
        ]
      );
    } catch (dbError) {
      console.error('DB insert error:', dbError.message);
    }
  }

  res.status(200).send({ received: true });
};
