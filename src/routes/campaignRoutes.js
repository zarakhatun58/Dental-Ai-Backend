import express from "express";
import {
  createCampaign,
  getAllCampaigns,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campController.js";

const router = express.Router();

router.post("/", createCampaign);
router.get("/", getAllCampaigns);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);

export default router;
