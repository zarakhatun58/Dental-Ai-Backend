// src/controllers/stripeController.js
import Stripe from 'stripe';
import pool from '../config/db.js'; // If using MySQL for saving transactions
import { sendSMS } from "../utils/sendSMS.js";
import { sendAndStoreNotification } from '../utils/sendNotification.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Create a Stripe Checkout session

// export const createCheckoutSession = async (req, res) => {
//   try {
//        const userId = req.userId ?? null; 
//     const { patient, service, amount, email, phone, bookingId } = req.body; // ✅ include phone
//     const successUrl = `${process.env.FRONTEND_URL}/success`;
//     const cancelUrl = `${process.env.FRONTEND_URL}/cancel`;

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: `${service} for ${patient}`,
//             },
//             unit_amount: parseFloat(amount) * 100,
//           },
//           quantity: 1,
//         },
//       ],
//       mode: 'payment',
//       success_url: successUrl,
//       cancel_url: cancelUrl,
//       customer_email: email,
//       metadata: {
//         patient,
//         phone,
//         bookingId,
//         email,
//       },
//     });

//     console.log("✅ Stripe Success URL:", successUrl);
//     console.log("✅ Stripe Cancel URL:", cancelUrl);
//     const paymentLink = session.url;

//     // ✅ Send SMS or Email to the patient
//     // await sendNotificationToPatient({ phone, email, paymentLink, patient, service });

//     // ✅ Notify admin of new checkout link created
//     // await notifyAdmin({ patient, service, amount, link: paymentLink });
//     await pool.query(
//       'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
//       [userId, 'Payment Received', 'Your payment of $99 was successful.', 'payment']
//     );
//     res.status(200).json({ url: paymentLink });
//     // await sendAndStoreNotification({
//     //   userId: req.userId,
//     //   title: "Invoice Sent",
//     //   type: "payment",
//     //   message: `An invoice has been sent ${total}.`
//     // });

//   } catch (err) {
//     console.error('Stripe Checkout error:', err.message);
//     res.status(500).json({ error: 'Something went wrong with Stripe' });
//   }
// };

export const createCheckoutSession = async (req, res) => {
  try {
   const userId = req.userId ?? null;
    const { patient, service, amount, email, phone, bookingId } = req.body;

    // ✅ Log the incoming data
    console.log("➡️ Received Stripe Checkout Data:", {
      patient,
      service,
      amount,
      email,
      phone,
      bookingId,
    });

    // ✅ Validate required fields
    if (!patient || !service || !email || !amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: "Missing or invalid fields in request" });
    }

    const chargeAmount = parseFloat(amount) * 100;

    // ✅ Ensure FRONTEND_URL is defined
    const successUrl = `${process.env.FRONTEND_URL || "https://dental-flow-ai-agent.lovable.app"}/success`;
    const cancelUrl = `${process.env.FRONTEND_URL || "https://dental-flow-ai-agent.lovable.app"}/cancel`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${service} for ${patient}`,
            },
            unit_amount: chargeAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        patient,
        phone,
        bookingId,
        email,
      },
    });

    const paymentLink = session.url;

    // ✅ Log Stripe response
    console.log("✅ Stripe Checkout Session Created:", paymentLink);

    // ✅ Store notification
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, 'Payment Received', 'Your payment of $' + amount + ' was successful.', 'payment']
    );

    res.status(200).json({ url: paymentLink });

  } catch (err) {
    console.error('❌ Stripe Checkout Error:', err.message);
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { patient, service, amount, phone, email } = req.body; // ✅ include email

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amount * 100), // amount in cents
            product_data: {
              name: service,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    const paymentLink = session.url;

    // ✅ Send SMS
    if (phone) {
      const smsBody = `Hi ${patient}, please complete your payment for ${service}: ${paymentLink}`;
      await sendSMS(phone, smsBody);
    }

    // ✅ Send Email
    if (email) {
      const emailBody = `
        <p>Dear ${patient},</p>
        <p>Please complete your payment for <strong>${service}</strong> by clicking the link below:</p>
        <a href="${paymentLink}">Complete Payment</a>
        <p>Thank you!</p>
      `;
      await sendEmail(email, `Payment Request for ${service}`, emailBody);
    }

    res.status(200).json({ url: paymentLink });
  } catch (err) {
    console.error("❌ Stripe or SMS Error:", err.message);
    res.status(500).json({ error: "Checkout session creation failed" });
  }
}

export const handleSuccessPage = async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).send("Missing session_id.");
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const bookingId = session.metadata?.bookingId;
    const patient = session.metadata?.patient;
    const email = session.metadata?.email;
    const phone = session.metadata?.phone;

    // Optional: update DB to mark as paid
    await pool.query(
      "UPDATE appointment SET Paid = 1 WHERE AptNum = ?",
      [bookingId]
    );

    // Return simple HTML or JSON response
    res.send(`
      <h2>✅ Thank you for your payment!</h2>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Patient:</strong> ${patient}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
    `);
  } catch (err) {
    console.error("Stripe success handler error:", err.message);
    res.status(500).send("Something went wrong. Please contact support.");
  }
};