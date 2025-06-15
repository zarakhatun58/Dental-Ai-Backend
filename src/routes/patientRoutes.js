import express from 'express';
import {
  addPatient,
  getAllPatients,
  updatePatient,
  deletePatient,
} from '../controllers/patientController.js';

const router = express.Router();

router.post('/', addPatient);
router.get('/', getAllPatients);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;
