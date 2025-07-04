import Stripe from 'stripe';
import pool from '../config/db.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
