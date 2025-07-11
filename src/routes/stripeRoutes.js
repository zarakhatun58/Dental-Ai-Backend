// src/routes/stripeRoutes.js
import express from 'express';
import {
  createCheckoutSession,
  handleWebhook
} from '../controllers/stripeController.js';
import bodyParser from 'body-parser';

const router = express.Router();

router.post('/checkout', createCheckoutSession);

// Stripe requires raw body for webhook verification
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), handleWebhook);

// Example: Express route
router.post("/api/stripe/confirm", async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Lookup user or booking by session metadata or customer email
      const userId = await getUserIdFromSession(session);

      return res.status(200).json({ success: true, userId });
    } else {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }
  } catch (err) {
    console.error("Stripe confirm error:", err);
    res.status(500).json({ success: false, message: "Stripe verification failed" });
  }
});


export default router;
