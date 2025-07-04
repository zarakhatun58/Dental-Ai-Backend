
import { GoogleGenerativeAI } from "@google/generative-ai";
import pool from "../config/db.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const getDashboardData = async (req, res) => {
  try {
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT CASE WHEN DATEDIFF(NOW(), a.AptDateTime) > 180 THEN p.PatNum END) AS atRisk,
        COUNT(DISTINCT CASE WHEN a.AptStatus = 'rebooked' THEN a.AptNum END) AS rebooked,
        SUM(CASE WHEN a.ProcCode IN ('CROWN', 'WHITEN') THEN a.Fee ELSE 0 END) AS revenue,
        COUNT(DISTINCT CASE WHEN a.AptDateTime IS NULL THEN p.PatNum END) AS emptyChairs
      FROM patient p
      LEFT JOIN appointment a ON p.PatNum = a.PatNum;
    `);

    const [activity] = await pool.execute(`
      SELECT * FROM recent_activity ORDER BY created_at DESC LIMIT 5;
    `);

    res.json({ metrics: summary[0], activity });
  } catch (err) {
    console.error("❌ Dashboard Error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
};

export const getAIRecommendations = async (req, res) => {
  try {
    const patientStats = `
      - No-show risks tomorrow: Sarah M. (85%)
      - Cavity risk: 23 overdue patients
      - Crowns needed: 15 patients
      - Lapsed patients: 67 over 12 months
      - Friday underbooking trend: 2-5PM
    `;

    const prompt = `
      Based on the stats below, generate 5 smart AI recommendations as structured JSON objects. Each object must include:
      - id
      - type (booking, campaign, pricing, scheduling, retention)
      - priority (high, medium, low)
      - title
      - description
      - impact
      - action
      - confidence (in %)

      Stats:
      ${patientStats}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let recommendations = [];
    try {
      recommendations = JSON.parse(text);
    } catch (e) {
      console.warn("⚠️ Failed to parse Gemini response, falling back to defaults.");
      recommendations = [
        {
          id: 1,
          type: "booking",
          priority: "high",
          title: "Double-book high-risk appointments",
          description: "Tomorrow's 2 PM slot has Sarah M. (85% no-show risk)...",
          impact: "$450 revenue protection",
          action: "Auto-book Emily R.",
          confidence: 92
        }
      ];
    }

    res.json({ recommendations });
  } catch (err) {
    console.error("❌ AI Insight Error:", err);
    res.status(500).json({ error: "Failed to generate recommendations." });
  }
};
