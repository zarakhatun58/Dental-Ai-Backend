import express from "express";
import { sendOutreach } from "../controllers/outreachController.js";

const router = express.Router();

router.post("/send", sendOutreach);

export default router;
