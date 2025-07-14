
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/insurances", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT MIN(InsuranceID) AS id, InsuranceName AS label
   FROM insurances
   GROUP BY InsuranceName`
        );
        res.json(rows);
    } catch (err) {
        console.error("Failed to fetch insurances:", err);
        res.status(500).json({ error: "Failed to fetch insurances" });
    }
});


export default router;
