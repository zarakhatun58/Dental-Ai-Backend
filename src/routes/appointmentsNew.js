import express from 'express';
import dotenv from 'dotenv';
import { sendAndStoreNotification } from '../utils/sendNotification.js';
import pool from '../config/db.js';

dotenv.config();
const router = express.Router();

// ✅ Route using the pool
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.AptNum, 
        a.AptDateTime,
        p.PatNum,
        p.LName,
        p.FName,
        p.Birthdate
      FROM 
        appointment a
      JOIN 
        patient p ON a.PatNum = p.PatNum
      WHERE 
        a.AptDateTime >= NOW()
    `);

    res.json(rows);
    // await sendAndStoreNotification({
    //    userId: req.userId,
    //   title: "Appointment Booked",
    //   type: "appointmentsNew",
    //   message: `Appointment booked with ${patientName} on ${appointmentDate}.`
    // });
  } catch (error) {
    console.error("Error fetching appointments with patient:", error);
    res.status(500).json({ error: "Failed to fetch appointments with patient" });
  }
});

router.post("/book", async (req, res) => {
  // const { patientId, slotId, date, time, promoCode = null, prepayStatus } = req.body;
 const {
    patientId,
    user_Id,
    patient_name,
    slotId,
    date,
    time,
    promoCode = null,
    prepayStatus
  } = req.body;
  console.log("📥 Raw Body:", req.body);

  // Check for required fields
   const parsedPatientId = Number(patientId);
  const parsedUserId = Number(user_Id);
  const parsedPrepayStatus = prepayStatus === true || prepayStatus === "true";

  if (
    !parsedPatientId ||
    !parsedUserId ||
    !patient_name ||
    typeof slotId !== "string" ||
    typeof date !== "string" ||
    typeof time !== "string" ||
    typeof parsedPrepayStatus !== "boolean"
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }


  try {
    console.log("📅 Booking slot:", {
      patientId: parsedPatientId,
      slotId,
      date,
      time,
      promoCode,
      prepayStatus: parsedPrepayStatus
    });

    await pool.execute(
      `INSERT INTO bookings (patientId, slotId, date, time, promoCode, prepayStatus)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        parsedPatientId,
        slotId,
        date,
        time,
        promoCode || null,
        parsedPrepayStatus ? 1 : 0
      ]
    );

    return res.json({ success: true, message: "Booking confirmed!" });
  } catch (err) {
    console.error("❌ Booking failed:", err);
    return res.status(500).json({ error: "Booking failed" });
  }
});




router.get("/available", async (req, res) => {
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: "Missing date" });

  try {
    const [rows] = await pool.execute(
      "SELECT slot_id, date, time FROM appointment_slots WHERE date = ? AND is_booked = 0",
      [date]
    );

    const slots = rows.map((row) => ({
      slotId: row.slot_id,
      date: row.date,
      time: row.time,
    }));

    res.json({ slots });
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});


export default router;
