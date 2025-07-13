// routes/patientRoutes.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import pool from "../config/db.js";
import { sendAndStoreNotification } from "../utils/sendNotification.js";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        MAX(a.AptDateTime) AS lastVisit
      FROM patient p
      LEFT JOIN appointment a ON a.PatNum = p.PatNum
      GROUP BY p.PatNum
      ORDER BY lastVisit DESC
      LIMIT 20;
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
        lastVisit: lastVisitDate ? lastVisitDate.toISOString().split("T")[0] : "N/A",
        daysSince
      };
    });

    if (!patients.length) {
      throw new Error("No valid patients found.");
    }

    console.log("🧪 Patient Data Sent to Gemini:", patients);

    const prompt = `Analyze this dental patient data and provide a risk level, no-show probability, and upsell opportunity per patient:\n\n${JSON.stringify(patients)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiInsights = await response.text();

    await sendAndStoreNotification({
      userId: req.userId ?? 1,
      title: "AI Insight Available",
      type: "ai-insights",
      context: "New AI-driven recommendations are available for your practice."
    });

    res.json({ patients, aiInsights });
  } catch (err) {
    console.error("❌ AI Route Error:", err.message);
    res.status(500).json({ error: "Failed to fetch AI insights." });
  }
});







export default router;
