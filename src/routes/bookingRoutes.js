import express from "express";
import { askGemini } from "../utils/gemini.js"; // optional Gemini integration
import pool from "../config/db.js";

const router = express.Router();

router.post("/book-appointment", async (req, res) => {
  const {
    fullName,
    phone,
    email,
    insurance,
    date,
    time,
    chair,
    hygienist,
    promoCode
  } = req.body;

  try {
    const [FName, ...LNameArr] = fullName.split(" ");
    const LName = LNameArr.join(" ") || "";

    // Save patient
    const [patientResult] = await pool.query(
      `INSERT INTO patient (FName, LName, WirelessPhone, Email) VALUES (?, ?, ?, ?)`,
      [FName, LName, phone, email]
    );
    const PatNum = patientResult.insertId;

    // Map chair to operatory number
    const chairMap = {
      "Chair 1 (Window View)": 1,
      "Chair 2 (Garden View)": 2,
      "Chair 3 (Premium)": 3,
    };
    const Op = chairMap[chair] || 1;
    const AptDateTime = `${date} ${time}:00`;

    const [aptResult] = await pool.query(
      `INSERT INTO appointment (PatNum, AptDateTime, Op, ProcDescript) VALUES (?, ?, ?, ?)`,
      [PatNum, AptDateTime, Op, "Cleaning"]
    );

    // Optional: Gemini Upsell Suggestion
    let upsell = null;
    try {
      const prompt = `
A patient named ${fullName} is booked for cleaning at ${time}.
Phone: ${phone}, Email: ${email}.
Is there an upsell opportunity like whitening or crowns?
Respond with:
- "yes: [short reason]"
- "no"
      `;
      const geminiResponse = await askGemini(prompt);
      if (geminiResponse.toLowerCase().startsWith("yes")) {
        upsell = geminiResponse;
      }
    } catch (err) {
      console.warn("Gemini error:", err.message);
    }

    res.json({
      message: "Appointment booked successfully",
      appointmentId: aptResult.insertId,
      upsellSuggestion: upsell
    });
  } catch (err) {
    console.error("Booking failed:", err.message);
    res.status(500).json({ error: "Booking failed", details: err.message });
  }
});

export default router;
