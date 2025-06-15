import express from 'express';
import {
  addPatient,
  getAllPatients,
  updatePatient,
  deletePatient,
  getLapsedPatients,
  getHighNoShowPatients,
} from '../controllers/patientController.js';

const router = express.Router();

router.post('/', addPatient);
router.get('/', getAllPatients);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);
router.get('/lapsed', getLapsedPatients);
router.get("/no-shows", getHighNoShowPatients);

export default router;
