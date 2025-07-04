import express from 'express';
import { handleSuccessPage } from '../controllers/paymentSucces.js';

const router = express.Router();

router.get('/', handleSuccessPage);

export default router;
