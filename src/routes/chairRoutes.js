import express from "express";
import { getChairs } from "../controllers/chairController.js";

const router = express.Router();
router.get("/chairs", getChairs);
export default router;
