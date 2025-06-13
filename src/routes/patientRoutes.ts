import express from "express";
import { createPatient, getAllPatients } from "../controllers/patientController";

const router = express.Router();

router.get("/", getAllPatients);
router.post("/", createPatient);

export default router;
