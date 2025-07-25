// routes/patientRoutes.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import pool from "../config/db.js";
import { sendAndStoreNotification, sendReminder } from "../utils/sendNotification.js";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// router.get("/ai-insights", async (req, res) => {
//   try {
//     const [rows] = await pool.execute(`
//       SELECT 
//         p.PatNum AS id,
//         CONCAT(p.LName, ' ', p.FName) AS name,
//         COALESCE(p.WirelessPhone, p.HmPhone, p.WkPhone) AS phone,
//         p.Email AS email,
//         MAX(a.AptDateTime) AS lastVisit
//       FROM patient p
//       LEFT JOIN appointment a ON a.PatNum = p.PatNum
//       WHERE p.PatStatus = 0
//       GROUP BY p.PatNum
//       ORDER BY lastVisit DESC
//       LIMIT 10;
//     `);

//     const patients = rows.map((p) => {
//       const lastVisitDate = p.lastVisit ? new Date(p.lastVisit) : null;
//       const daysSince = lastVisitDate
//         ? Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
//         : null;

//       return {
//         id: p.id,
//         name: p.name,
//         lastVisit: lastVisitDate ? lastVisitDate.toISOString().split("T")[0] : "N/A",
//         daysSince: daysSince ?? 999,
//         phone: p.phone?.trim() || "",
//         email: p.email?.trim() || "",
//       };
//     });

//     let insights = null;

//     // 🧠 Try to get Gemini response — fallback if it fails
//     try {
//       const prompt = `
// You are an AI dental assistant. Analyze the following OpenDental patient data and suggest:
// - Their risk level based on days since last visit
// - Potential upsell services
// - Any note if they are overdue
// Data:
// ${JSON.stringify(patients, null, 2)}
//       `;

//       const result = await model.generateContent(prompt);
//       insights = await result.response.text();
//     } catch (err) {
//       console.warn("⚠️ Gemini API failed. Proceeding without insights:", err.message);
//     }

//     res.json({
//       patients,
//       insights, // Will be null if Gemini fails
//     });

//   } catch (err) {
//     console.error("❌ Fatal backend error:", err.message);
//     res.status(500).json({ error: "Failed to fetch patients." });
//   }
// });


router.get("/ai-insights", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.PatNum AS id,
        CONCAT(p.LName, ' ', p.FName) AS name,
        COALESCE(p.WirelessPhone, p.HmPhone, p.WkPhone) AS phone,
        p.Email AS email,
        p.riskLevel,
        MAX(a.AptDateTime) AS lastVisit
      FROM patient p
      LEFT JOIN appointment a ON a.PatNum = p.PatNum
      GROUP BY p.PatNum
      ORDER BY lastVisit DESC
      LIMIT 50;
    `);

    const patients = rows.map((p) => {
      const lastVisitDate = p.lastVisit ? new Date(p.lastVisit) : null;
      const daysSince = lastVisitDate
        ? Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      return {
        id: p.id,
        name: p.name,
        phone: p.phone?.trim() || "",
        email: p.email?.trim() || "",
        riskLevel: p.riskLevel?.trim().toLowerCase() || "unknown",
        lastVisit: lastVisitDate ? lastVisitDate.toISOString().split("T")[0] : "N/A",
        daysSince,
      };
    });

    if (!patients.length) {
      return res.json({ patients: [], aiInsights: "No patient data available." });
    }

    const prompt = `
Analyze the following dental patients and return ONLY a JSON array.

Each object should include:
- id
- noShowProbability (0–100)
- upsellPotential ("Low", "Medium", "High")
- riskLevel ("low", "medium", "high")

Respond only with raw JSON (no Markdown, no explanation, no formatting).

Patients:
${JSON.stringify(patients)}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    let aiData = [];
    try {
      const cleaned = text.replace(/```(?:json)?\s*|\s*```/g, "").trim();
      aiData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("❌ Failed to parse Gemini output:", parseErr);
      return res.status(500).json({
        error: "AI responded with invalid JSON.",
        raw: text,
      });
    }

    res.json({ patients, aiInsights: aiData });

    // Optionally store AI data in DB for reuse later
    // await saveAIInsightsToDB(aiData);

  } catch (err) {
    console.error("❌ AI Insights Route Error:", err);
    res.status(500).json({ error: "Failed to fetch AI insights." });
  }
});


router.post("/send-sms", async (req, res) => {
  const { phone, email, message, subject } = req.body;

  try {
    const result = await sendReminder({ phone, email, message, subject });

    res.json({
      success: true,
      sent: {
        sms: result.sms?.sid || "not sent",
        email: result.email?.messageId || "not sent",
      },
    });
  } catch (err) {
    console.error("❌ Reminder send failed:", err);
    res.status(500).json({ error: "Failed to send reminder." });
  }
});










export default router;
