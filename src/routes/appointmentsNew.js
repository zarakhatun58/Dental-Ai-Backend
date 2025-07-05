import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { sendNotification } from '../utils/sendNotification.js';

dotenv.config();
const router = express.Router();

// ✅ Create pool once
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'opendental',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

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
    await sendNotification({
        user_id: req.userId,
      title: "Appointment Booked",
      type: "appointmentsNew",
      context: `Appointment booked with ${patientName} on ${appointmentDate}.`
    });
  } catch (error) {
    console.error("Error fetching appointments with patient:", error);
    res.status(500).json({ error: "Failed to fetch appointments with patient" });
  }
});

export default router;
