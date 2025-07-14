import express from 'express';
import { getSlotsByDate, bookSlot } from '../controllers/slotController.js';
import pool from '../config/db.js';

const router = express.Router();

router.get('/slots', getSlotsByDate);  // ?date=YYYY-MM-DD
router.post('/slots/book', bookSlot);  // { patientId, date, time, chair }

router.get('/timeslots', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT time FROM timeslots ORDER BY time ASC`);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching timeslots:", err);
    res.status(500).json({ error: "Could not fetch timeslots" });
  }
});

export default router;
