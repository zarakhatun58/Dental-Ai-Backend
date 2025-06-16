import express from 'express';
import { getAnalytics, getNoShowAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/', getAnalytics);
router.get('/no-shows', getNoShowAnalytics);

export default router;
