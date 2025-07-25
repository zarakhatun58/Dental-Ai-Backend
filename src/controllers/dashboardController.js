import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../config/db.js';
import { sendAndStoreNotification } from '../utils/sendNotification.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export const getDashboardData = async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     if (!userId) {
//       return res.status(400).json({ error: "Missing userId in request." });
//     }

//     // const [metrics] = await pool.query(
//     //   "SELECT * FROM dashboard_metrics WHERE user_id = ?",
//     //   [userId]
//     // );
//     const [metrics] = await pool.query(
//   "SELECT * FROM dashboard_metrics WHERE user_id = ? ORDER BY id DESC LIMIT 1",
//   [userId]
// );

//     const recentActivity = [
//       {
//         type: "booking",
//         message: "AI booked Sarah M. for cleaning (high upsell probability)",
//         time: "2 min ago",
//         priority: "high",
//       },
//       {
//         type: "payment",
//         message: "$89 pre-payment received from John D.",
//         time: "5 min ago",
//         priority: "medium",
//       },
//       {
//         type: "campaign",
//         message: "Sent discount offers to 23 at-risk patients",
//         time: "15 min ago",
//         priority: "medium",
//       },
//       {
//         type: "prediction",
//         message: "Flagged 3 patients as no-show risks for tomorrow",
//         time: "1 hour ago",
//         priority: "high",
//       },
//     ];

//     if (!metrics || metrics.length === 0) {
//       console.warn("⚠️ No data in DB, returning fallback data");
//       return res.json({
//         user_id: userId,
//         revenue: "15250.00",
//         emptyChairs: 8,
//         patientsAtRisk: 23,
//         newAtRisk: 4,
//         rebookedPatients: 18,
//         crownUpsell: "12450.00",
//         crownPatients: 15,
//         whiteningUpsell: "3200.00",
//         whiteningPatients: 32,
//         emergencySlots: 18,
//         recentActivity,
//       });
//     }

//     const dashboardData = {
//       ...metrics[0],
//       recentActivity,
//     };

//     res.json(dashboardData);

//     // Safe notification trigger after response
//     // sendAndStoreNotification({
//     //   userId,
//     //   title: "Dashboard Accessed",
//     //   type: "dashboard",
//     //   context: `User accessed the dashboard on ${new Date().toLocaleString()}.`,
//     // }).catch(err => console.warn("Notification error:", err.message));

//   } catch (error) {
//   console.error("Dashboard Error:", error); 
//     res.status(500).json({ error: "Failed to fetch dashboard data" });
//   }
// };


// export const getDashboardData = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     console.log("➡️ Dashboard requested for userId:", userId);

//     if (!userId) {
//       console.error("❌ Missing userId");
//       return res.status(400).json({ error: "Missing userId in request." });
//     }

//     const [metrics] = await pool.query(
//       "SELECT * FROM dashboard_metrics WHERE user_id = ? ORDER BY id DESC LIMIT 1",
//       [userId]
//     );

//     console.log("📊 Metrics result:", metrics);

//     const recentActivity = [
//       {
//         type: "booking",
//         message: "AI booked Sarah M. for cleaning (high upsell probability)",
//         time: "2 min ago",
//         priority: "high",
//       },
//       {
//         type: "payment",
//         message: "$89 pre-payment received from John D.",
//         time: "5 min ago",
//         priority: "medium",
//       },
//       {
//         type: "campaign",
//         message: "Sent discount offers to 23 at-risk patients",
//         time: "15 min ago",
//         priority: "medium",
//       },
//       {
//         type: "prediction",
//         message: "Flagged 3 patients as no-show risks for tomorrow",
//         time: "1 hour ago",
//         priority: "high",
//       },
//     ];

//     if (!metrics || metrics.length === 0) {
//       console.warn("⚠️ No metrics found, sending fallback data");
//       return res.json({
//         user_id: userId,
//         revenue: "15250.00",
//         emptyChairs: 8,
//         patientsAtRisk: 23,
//         newAtRisk: 4,
//         rebookedPatients: 18,
//         crownUpsell: "12450.00",
//         crownPatients: 15,
//         whiteningUpsell: "3200.00",
//         whiteningPatients: 32,
//         emergencySlots: 18,
//         recentActivity,
//       });
//     }

//     const dashboardData = {
//       ...metrics[0],
//       recentActivity,
//     };

//     console.log("✅ Dashboard data sent");
//     res.json(dashboardData);

//   } catch (error) {
//     console.error("❌ Dashboard Error:", error);
//     res.status(500).json({ error: "Failed to fetch dashboard data" });
//   }
// };

const generateAIInsight = async (metrics) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an AI assistant for a dental clinic's dashboard.

Based on this data:
- Revenue: $${metrics.revenue}
- Empty Chairs: ${metrics.emptyChairs}
- Patients At Risk: ${metrics.patientsAtRisk}
- New At Risk: ${metrics.newAtRisk}
- Rebooked Patients: ${metrics.rebookedPatients}
- Crown Upsell: $${metrics.crownUpsell}
- Whitening Upsell: $${metrics.whiteningUpsell}

Give a 2-sentence summary with:
1. An insight (e.g. patient behavior, trends)
2. A recommendation (e.g. AI campaign or promotion idea)

Be concise and business-friendly.
`;

    // const result = await model.generateContent(prompt);
    // return result.response.text().trim() || "No insight generated.";
  } catch (err) {
    // console.error("🧠 Gemini AI Error:", err);
    return "Insight generation failed. Try again later.";
  }
};



export const getDashboardData = async (req, res) => {
  try {
    const userId = req.params.userId;
    // console.log("➡️ Dashboard requested for userId:", userId);

    if (!userId) {
      console.error("❌ Missing userId");
      return res.status(400).json({ error: "Missing userId in request." });
    }

    // Get main metrics
    // const [metrics] = await pool.query(
    //   "SELECT * FROM dashboard_metrics WHERE user_id = ? ORDER BY id DESC LIMIT 1",
    //   [userId]
    // );
const [metricsRows] = await pool.query(
  "SELECT * FROM dashboard_metrics WHERE user_id = ? ORDER BY id DESC LIMIT 1",
  [userId]
);
const metrics = metricsRows[0];

if (!metricsRows || metricsRows.length === 0) {
  console.warn("⚠️ No metrics found for user:", userId);
  return res.status(404).json({ error: "No dashboard metrics found." });
}
    // Get bookings
    const [bookings] = await pool.query(
      `SELECT patient_name, created_at FROM bookings 
       WHERE user_id = ? ORDER BY created_at DESC LIMIT 3`,
      [userId]
    );

    // Get payments
    const [payments] = await pool.query(
      `SELECT amount, patient_name, paid_at FROM payments 
       WHERE user_id = ? ORDER BY paid_at DESC LIMIT 3`,
      [userId]
    );

    // Get campaigns
    const [campaigns] = await pool.query(
      `SELECT 
  CONCAT(
    'Campaign "', name, '" (', type, ') sent to ', sent, ' patients. Discount: ', COALESCE(discount, 'N/A')
  ) AS message,
  created_at
FROM campaigns 
WHERE user_id = ? 
ORDER BY created_at DESC 
LIMIT 2
`,
      [userId]
    );


    // Construct recent activity from real data
    const recentActivity = [];

    bookings.forEach((b) =>
      recentActivity.push({
        type: "booking",
        message: `AI booked ${b.patient_name} for cleaning.`,
        time: new Date(b.created_at).toLocaleTimeString(),
        priority: "high",
      })
    );

    payments.forEach((p) =>
      recentActivity.push({
        type: "payment",
        message: `$${p.amount} payment received from ${p.patient_name}`,
        time: new Date(p.paid_at).toLocaleTimeString(),
        priority: "medium",
      })
    );

    campaigns.forEach((c) =>
      recentActivity.push({
        type: "campaign",
        message: c.message,
        time: new Date(c.created_at).toLocaleTimeString(),
        priority: "medium",
      })
    );

    // If no metrics found, send fallback
    // if (!metrics || metrics.length === 0) {
    //   console.warn("⚠️ No metrics found, sending fallback data");
    //   return res.json({
    //     user_id: userId,
    //     revenue: "15250.00",
    //     emptyChairs: 8,
    //     patientsAtRisk: 23,
    //     newAtRisk: 4,
    //     rebookedPatients: 18,
    //     crownUpsell: "12450.00",
    //     crownPatients: 15,
    //     whiteningUpsell: "3200.00",
    //     whiteningPatients: 32,
    //     emergencySlots: 18,
    //     recentActivity,
    //   });
    // }

    // const aiInsight = await generateAIInsight(metrics);
    const dashboardData = {
      ...metrics,
      recentActivity,
      // aiInsight,
    };

    // console.log("📤 AI Insight for UI:", aiInsight);
    return res.json(dashboardData); 
  } catch (error) {
    console.error("❌ Dashboard Error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};
