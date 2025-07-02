import express from 'express';
import { getAlertsByDate } from '../controllers/alertController.js';

const router = express.Router();
router.get('/alerts', getAlertsByDate);
export default router;
