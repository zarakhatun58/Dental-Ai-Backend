import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/logs", async (req, res) => {
  try {
    const [emailLogs] = await pool.query("SELECT * FROM email_log ORDER BY sent_at DESC LIMIT 50");
    const [smsLogs] = await pool.query("SELECT * FROM sms_log ORDER BY sent_at DESC LIMIT 50");

    res.json({ emailLogs, smsLogs });
  } catch (err) {
    console.error("❌ Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

export default router;
