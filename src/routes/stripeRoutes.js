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

export default router;
