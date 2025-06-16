import express from "express";
import {
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor
} from "../controllers/doctorController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getAllDoctors);
router.post("/", createDoctor);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);
router.post('/create', upload.single('image'), createDoctor);

export default router;
