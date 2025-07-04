// routes/patientRoutes.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import pool from "../config/db.js";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.get("/ai-insights", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.PatNum AS id,
        CONCAT(p.LName, ' ', p.FName) AS name,
        COALESCE(p.WirelessPhone, p.HmPhone, p.WkPhone) AS phone,
        p.Email AS email,
        MAX(a.AptDateTime) AS lastVisit
      FROM patient p
      LEFT JOIN appointment a ON a.PatNum = p.PatNum
      WHERE p.PatStatus = 0
      GROUP BY p.PatNum
      ORDER BY lastVisit DESC
      LIMIT 10;
    `);

    const patients = rows.map((p) => {
      const lastVisitDate = p.lastVisit ? new Date(p.lastVisit) : null;
      const daysSince = lastVisitDate
        ? Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        id: p.id,
        name: p.name,
        lastVisit: lastVisitDate ? lastVisitDate.toISOString().split("T")[0] : "N/A",
        daysSince: daysSince ?? 999,
        phone: p.phone?.trim() || "",
        email: p.email?.trim() || "",
      };
    });

    // 🧠 Ask Gemini for AI analysis
    const prompt = `
You are an AI dental assistant. Analyze the following OpenDental patient data and suggest:
- Their risk level based on days since last visit
- Potential upsell services
- Any note if they are overdue
Data:
${JSON.stringify(patients, null, 2)}
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response.text();

    res.json({
      patients,
      insights: aiResponse,
    });

  } catch (err) {
    console.error("Error generating AI insights:", err.message);
    res.status(500).json({ error: "Failed to generate AI insights." });
  }
});


export default router;
