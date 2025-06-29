import express from "express";
import { getAllClinics, createClinic } from "../controllers/clinicController.js";

const router = express.Router();


router.get('/', getAllClinics);
router.post('/', createClinic);

export default router;
