import express from 'express';
import pool from "../config/db.js";
const router = express.Router();


router.post("/send-promo", async (req, res) => {
  const { patientId, method, promoCode, message } = req.body;

  if (!patientId || !method || !promoCode || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // 1. Save to promotions table
    await pool.query(
      `INSERT INTO promotions (patient_id, promo_code, method, sent_at) VALUES (?, ?, ?, NOW())`,
      [patientId, promoCode, method]
    );

    // 2. Get patient details from 'patient' table
    const [rows] = await pool.query(
      `SELECT FName, LName, Email, WirelessPhone FROM patient WHERE PatNum = ?`,
      [patientId]
    );
    const patient = rows[0];
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const fullName = `${patient.FName} ${patient.LName}`;
    const phone = patient.WirelessPhone;
    const email = patient.Email;

    // 3. Send promo via SMS or Email
    if (method === "sms" && phone) {
      await twilioClient.messages.create({
        body: message,
        to: phone,
        from: process.env.TWILIO_PHONE,
      });
    }

    if (method === "email" && email) {
      await transporter.sendMail({
        from: `"PromoBot" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🎁 Your Promo Code",
        text: message,
      });
    }

    // 4. Respond success
    res.json({ success: true });

    // 5. 🔔 Send notification (non-blocking)
    try {
      await sendAndStoreNotification({
        userId: req.user?.id || 1,
        title: `${method.toUpperCase()} sent to ${fullName}`,
        message: `Promo code ${promoCode} was sent to patient ${fullName} via ${method}.`,
        type: "contact"
      });
    } catch (notifErr) {
      console.warn("❌ Notification error (non-blocking):", notifErr.message);
    }

  } catch (err) {
    console.error("Send error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});



export default router;
