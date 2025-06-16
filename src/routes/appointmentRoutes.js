import express from 'express';
import {
  addAppointment,
  getAllAppointments,
  updateAppointment,
  deleteAppointment,
  bookAppointment,
} from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/', addAppointment);
router.get('/', getAllAppointments);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);
router.post("/book", bookAppointment);
export default router;
