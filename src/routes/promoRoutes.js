import express from 'express';
import pool from "../config/db.js";
const router = express.Router();


router.post("/send-promo", async (req, res) => {
  const { patientId, method, promoCode, message } = req.body;

  if (!patientId || !method || !promoCode || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // 1. Save to DB
    await pool.query(
      "INSERT INTO promotions (patient_id, promo_code, method, sent_at) VALUES (?, ?, ?, NOW())",
      [patientId, promoCode, method]
    );

    // 2. Get patient info
    const [rows] = await pool.query("SELECT name, email, phone FROM patients WHERE id = ?", [patientId]);
    const patient = rows[0];
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // 3. Send message
    if (method === "sms" && patient.phone) {
      await twilioClient.messages.create({
        body: message,
        to: patient.phone,
        from: process.env.TWILIO_PHONE,
      });
    }

    if (method === "email" && patient.email) {
      await transporter.sendMail({
        from: `"PromoBot" <${process.env.EMAIL_USER}>`,
        to: patient.email,
        subject: "🎁 Your Promo Code",
        text: message,
      });
    }

    // 4. ✅ Send notification (non-blocking)
    try {
      await sendAndStoreNotification({
        userId: req.user?.id || 1, // fallback to user ID 1 if no auth
        title: `${method.toUpperCase()} sent to ${patient.name}`,
        type: "contact",
        context: `Promo code ${promoCode} was sent to patient ${patient.name} via ${method}.`,
      });
    } catch (notifErr) {
      console.warn("❌ Notification error (non-blocking):", notifErr.message);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Send error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});



export default router;
