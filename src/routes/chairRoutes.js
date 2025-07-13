import express from "express";
import { getChairs } from "../controllers/chairController.js";

const router = express.Router();
router.get("/chairs", getChairs);
router.get("/insurances", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT InsuranceID AS id, InsuranceName AS label FROM insurance`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch insurances" });
  }
});
export default router;
