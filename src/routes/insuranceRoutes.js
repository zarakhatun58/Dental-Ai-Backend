
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/insurances", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT InsuranceID AS id, Name AS label FROM insurance");
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch insurances:", err);
    res.status(500).json({ error: "Failed to fetch insurance options" });
  }
});

export default router;
