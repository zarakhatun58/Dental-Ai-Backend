import express from "express";
import { getMatricsData, getAIRecommendations } from "../controllers/recomendationController.js";

const router = express.Router();

router.get("/matrics", getMatricsData);
router.get("/recomendation", getAIRecommendations);

export default router;