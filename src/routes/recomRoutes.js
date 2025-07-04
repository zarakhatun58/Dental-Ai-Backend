import express from "express";
import { getDashboardData, getAIRecommendations } from "../controllers/recomendationController.js";

const router = express.Router();

router.get("/:userId", getDashboardData);
router.get("/recomendation", getAIRecommendations);

export default router;