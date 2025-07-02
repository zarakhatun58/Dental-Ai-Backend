import express from 'express';
import { getSlotsByDate, bookSlot } from '../controllers/slotController.js';

const router = express.Router();

router.get('/slots', getSlotsByDate);  // ?date=YYYY-MM-DD
router.post('/slots/book', bookSlot);  // { patientId, date, time, chair }

export default router;
