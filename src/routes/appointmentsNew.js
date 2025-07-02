// routes/appointments.js
import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const db = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'opendental',
};

// GET upcoming appointments
router.get("/", async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    const [rows] = await connection.execute(`
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

    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error("Error fetching appointments with patient:", error);
    res.status(500).json({ error: "Failed to fetch appointments with patient" });
  }
});


export default router;
