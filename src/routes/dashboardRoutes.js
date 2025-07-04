// routes/dashboardRoutes.js
import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';

const router = express.Router();

// GET /api/dashboard/:userId
router.get('/:userId', getDashboardData);

export default router;
