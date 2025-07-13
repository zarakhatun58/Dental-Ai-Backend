
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/insurances", async (req, res) => {
  try {
  const [rows] = await pool.query("SELECT InsuranceID AS id, InsuranceName AS label FROM insurances");
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch insurance:", err);
    res.status(500).json({ error: "Failed to fetch insurance options" });
  }
});

export default router;
