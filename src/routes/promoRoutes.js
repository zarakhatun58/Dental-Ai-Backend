import express from 'express';
import pool from "../config/db.js";
import { sendSMS } from '../utils/sendSMS.js';
import { sendEmail } from '../utils/email.js';
const router = express.Router();


// router.post("/send-promo", async (req, res) => {
//   const { patientId, method, promoCode, message } = req.body;

//   if (!patientId || !method || !promoCode || !message) {
//     return res.status(400).json({ error: "Missing fields" });
//   }

//   try {
//     // 1. Save to promotions table
//     await pool.query(
//       `INSERT INTO promotions (patient_id, promo_code, method, sent_at) VALUES (?, ?, ?, NOW())`,
//       [patientId, promoCode, method]
//     );

//     // 2. Get patient details from 'patient' table
//     const [rows] = await pool.query(
//       `SELECT FName, LName, Email, WirelessPhone FROM patient WHERE PatNum = ?`,
//       [patientId]
//     );
//     const patient = rows[0];
//     if (!patient) return res.status(404).json({ error: "Patient not found" });

//     const fullName = `${patient.FName} ${patient.LName}`;
//     const phone = patient.WirelessPhone;
//     const email = patient.Email;

//     // 3. Send promo via SMS or Email
//     if (method === "sms" && phone) {
//       await twilioClient.messages.create({
//         body: message,
//         to: phone,
//         from: process.env.TWILIO_PHONE,
//       });
//     }

//     if (method === "email" && email) {
//       await transporter.sendMail({
//         from: `"PromoBot" <${process.env.EMAIL_USER}>`,
//         to: email,
//         subject: "🎁 Your Promo Code",
//         text: message,
//       });
//     }

//     // 4. Respond success
//     res.json({ success: true });

//     // 5. 🔔 Send notification (non-blocking)
//     try {
//       await sendAndStoreNotification({
//         userId: req.user?.id || 1,
//         title: `${method.toUpperCase()} sent to ${fullName}`,
//         message: `Promo code ${promoCode} was sent to patient ${fullName} via ${method}.`,
//         type: "contact"
//       });
//     } catch (notifErr) {
//       console.warn("❌ Notification error (non-blocking):", notifErr.message);
//     }

//   } catch (err) {
//     console.error("Send error:", err);
//     res.status(500).json({ error: "Failed to send message." });
//   }
// });

router.post("/send-promo", async (req, res) => {
  console.log("🟡 /send-promo called:", req.body);

  const { patientId, method, promoCode, message } = req.body;
  if (!patientId || !method || !promoCode || !message) {
    console.warn("❌ Missing fields send-promo:", { patientId, method, promoCode, message });
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT FName, LName, Email, WirelessPhone FROM patient WHERE PatNum = ?`,
      [patientId]
    );
    if (!rows || rows.length === 0) {
      console.warn("❌ Patient not found send-promo:", patientId);
      return res.status(404).json({ error: "Patient not found" });
    }

    const phone = rows[0].WirelessPhone;
    const email = rows[0].Email;

    await pool.query(
      `INSERT INTO promotions (patient_id, promo_code, method, sent_at) VALUES (?, ?, ?, NOW())`,
      [patientId, promoCode, method]
    );

    if (method === "sms") {
      if (!phone) return res.status(400).json({ error: "No phone on record" });
      await sendSMS(phone, message);
    }
    if (method === "email") {
      if (!email) return res.status(400).json({ error: "No email on record" });
      await sendEmail(email, "🎁 Your Promo Code", `<p>${message}</p>`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ /send-promo ERROR:", err);
    res.status(500).json({ error: "Server error sending promo" });
  }
});


router.post("/contact-patient", async (req, res) => {
  console.log("🟡 /contact-patient called:", req.body);
  const { patientId, method, message } = req.body;
  if (!patientId || !method || !message) {
    console.warn("❌ Missing fields contact:", { patientId, method, message });
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT FName, LName, Email, WirelessPhone FROM patient WHERE PatNum = ?`,
      [patientId]
    );
    if (!rows || rows.length === 0) {
      console.warn("❌ Patient not found contact:", patientId);
      return res.status(404).json({ error: "Patient not found" });
    }

    const phone = rows[0].WirelessPhone;
    const email = rows[0].Email;

    if (method === "sms") {
      if (!phone) return res.status(400).json({ error: "No phone on record" });
      await sendSMS(phone, message);
    }
    if (method === "email") {
      if (!email) return res.status(400).json({ error: "No email on record" });
      await sendEmail(email, `"Your Dentist Message"`, `<p>${message}</p>`);
    }
    if (method === "call") {
      console.log(`📞 Simulated call to ${phone}`);
    }

    await pool.query(
      `INSERT INTO contact_logs (patient_id, method, message) VALUES (?, ?, ?)`,
      [patientId, method, message]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ /contact-patient ERROR:", err);
    res.status(500).json({ error: "Failed to contact patient" });
  }
});


export default router;
