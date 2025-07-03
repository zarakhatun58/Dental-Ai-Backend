import express from "express";
import { getHygienists } from "../controllers/hygienistController.js";

const router = express.Router();
router.get("/hygienists", getHygienists);
export default router;
