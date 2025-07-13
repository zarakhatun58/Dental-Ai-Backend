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
    await sendAndStoreNotification({
       userId: req.userId,
      title: "Appointment Booked",
      type: "appointmentsNew",
      message: `Appointment booked with ${patientName} on ${appointmentDate}.`
    });
  } catch (error) {
    console.error("Error fetching appointments with patient:", error);
    res.status(500).json({ error: "Failed to fetch appointments with patient" });
  }
});

export default router;
