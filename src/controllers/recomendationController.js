
import { GoogleGenerativeAI } from "@google/generative-ai";
import pool from "../config/db.js";
import { sendNotification } from "../utils/sendNotification.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const getMatricsData = async (req, res) => {
  try {
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT CASE WHEN DATEDIFF(NOW(), a.AptDateTime) > 180 THEN p.PatNum END) AS atRisk,
        COUNT(DISTINCT CASE WHEN a.AptStatus = 'rebooked' THEN a.AptNum END) AS rebooked,
        SUM(CASE WHEN pc.ProcCode IN ('CROWN', 'WHITEN') THEN pl.ProcFee ELSE 0 END) AS revenue,
        COUNT(DISTINCT CASE WHEN a.AptDateTime IS NULL THEN p.PatNum END) AS emptyChairs
      FROM patient p
      LEFT JOIN appointment a ON p.PatNum = a.PatNum
      LEFT JOIN procedurelog pl ON a.AptNum = pl.AptNum
      LEFT JOIN procedurecode pc ON pl.CodeNum = pc.CodeNum;
    `);

    const [activity] = await pool.execute(`
      SELECT * FROM recent_activity ORDER BY created_at DESC LIMIT 5;
    `);
    console.log("📊 Dashboard Summary:", summary[0]);
    console.log("🧾 Recent Activity:", activity);
    res.json({ metrics: summary[0], activity });
    await sendNotification({
     user_id: req.userId,
      title: "Metrics Updated",
      type: "metrics",
      context: `Your latest performance metrics have been updated on the dashboard.`
    });
  } catch (err) {
    console.error("❌ Dashboard Error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
};


// export const getAIRecommendations = async (req, res) => {
//   try {
//     const patientStats = `
//       - No-show risks tomorrow: Sarah M. (85%)
//       - Cavity risk: 23 overdue patients
//       - Crowns needed: 15 patients
//       - Lapsed patients: 67 over 12 months
//       - Friday underbooking trend: 2-5PM
//     `;

//     const prompt = `
//       Based on the stats below, generate 5 smart AI recommendations as structured JSON objects. Each object must include:
//       - id
//       - type (booking, campaign, pricing, scheduling, retention)
//       - priority (high, medium, low)
//       - title
//       - description
//       - impact
//       - action
//       - confidence (in %)

//       Stats:
//       ${patientStats}
//     `;

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);
//     const text = result.response.text();

//     let recommendations = [];
//     try {
//       recommendations = JSON.parse(text);
//     } catch (e) {
//       console.warn("⚠️ Failed to parse Gemini response, falling back to defaults.");
//       recommendations = [
//         {
//           id: 1,
//           type: "booking",
//           priority: "high",
//           title: "Double-book high-risk appointments",
//           description: "Tomorrow's 2 PM slot has Sarah M. (85% no-show risk)...",
//           impact: "$450 revenue protection",
//           action: "Auto-book Emily R.",
//           confidence: 92
//         }
//       ];
//     }

//     res.json({ recommendations });
//   } catch (err) {
//     console.error("❌ AI Insight Error:", err);
//     res.status(500).json({ error: "Failed to generate recommendations." });
//   }
// };

export const getAIRecommendations = async (req, res) => {
  const fallbackRecommendations = [
    {
      id: 1,
      type: "booking",
      priority: "high",
      title: "Double-book high-risk appointments",
      description: "Tomorrow's 2 PM slot has Sarah M. (85% no-show risk). Consider double-booking with Emily R. who needs urgent cleaning.",
      impact: "$450 revenue protection",
      action: "Auto-book Emily R.",
      confidence: 92
    },
    {
      id: 2,
      type: "campaign",
      priority: "high",
      title: "Launch emergency filling campaign",
      description: "23 patients with overdue cleanings show cavity risk patterns. Send targeted campaign for emergency appointments.",
      impact: "$8,400 potential revenue",
      action: "Launch Campaign",
      confidence: 88
    },
    {
      id: 3,
      type: "pricing",
      priority: "medium",
      title: "Discount cleaning for crown patients",
      description: "15 patients need crowns but haven't booked cleanings. Offer free cleaning to secure $18,750 in crown work.",
      impact: "$18,750 upsell potential",
      action: "Send Offers",
      confidence: 76
    },
    {
      id: 4,
      type: "scheduling",
      priority: "medium",
      title: "Optimize Friday afternoon slots",
      description: "Friday 2-5 PM consistently underbooked. Target working professionals with evening/weekend contact preference.",
      impact: "12 hrs weekly capacity",
      action: "Adjust Targeting",
      confidence: 82
    },
    {
      id: 5,
      type: "retention",
      priority: "low",
      title: "Win back lapsed patients",
      description: "67 patients haven't visited in 12+ months. Offer significant discount to restart regular care cycle.",
      impact: "$12,600 annual value",
      action: "Create Win-Back Series",
      confidence: 65
    }
  ];

  try {
    const patientStats = `
      - No-show risks tomorrow: Sarah M. (85%)
      - Cavity risk: 23 overdue patients
      - Crowns needed: 15 patients
      - Lapsed patients: 67 over 12 months
      - Friday underbooking trend: 2-5PM
    `;

    const prompt = `
      Based on the stats below, generate 5 smart AI recommendations as structured JSON objects.
      Stats: ${patientStats}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let recommendations;
    try {
      recommendations = JSON.parse(text);
    } catch {
      recommendations = fallbackRecommendations;
    }

    res.status(200).json({
      recommendations,
      fallbackUsed: recommendations === fallbackRecommendations
    });
    await sendNotification({
      user_id: req.userId,
      title: "New Recommendation",
      type: "recommendation",
      context: `A new recommendation is available based on recent data trends.`
    });

  } catch (err) {
    console.error("❌ AI Insight Error:", err);
    res.status(200).json({
      recommendations: fallbackRecommendations,
      fallbackUsed: true
    });
  }
};