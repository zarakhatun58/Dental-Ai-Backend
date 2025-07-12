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


export const getDashboardData = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("➡️ Dashboard requested for userId:", userId);

    if (!userId) {
      console.error("❌ Missing userId");
      return res.status(400).json({ error: "Missing userId in request." });
    }

    const [metrics] = await pool.query(
      "SELECT * FROM dashboard_metrics WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId]
    );

    console.log("📊 Metrics result:", metrics);

    const recentActivity = [
      {
        type: "booking",
        message: "AI booked Sarah M. for cleaning (high upsell probability)",
        time: "2 min ago",
        priority: "high",
      },
      {
        type: "payment",
        message: "$89 pre-payment received from John D.",
        time: "5 min ago",
        priority: "medium",
      },
      {
        type: "campaign",
        message: "Sent discount offers to 23 at-risk patients",
        time: "15 min ago",
        priority: "medium",
      },
      {
        type: "prediction",
        message: "Flagged 3 patients as no-show risks for tomorrow",
        time: "1 hour ago",
        priority: "high",
      },
    ];

    if (!metrics || metrics.length === 0) {
      console.warn("⚠️ No metrics found, sending fallback data");
      return res.json({
        user_id: userId,
        revenue: "15250.00",
        emptyChairs: 8,
        patientsAtRisk: 23,
        newAtRisk: 4,
        rebookedPatients: 18,
        crownUpsell: "12450.00",
        crownPatients: 15,
        whiteningUpsell: "3200.00",
        whiteningPatients: 32,
        emergencySlots: 18,
        recentActivity,
      });
    }

    const dashboardData = {
      ...metrics[0],
      recentActivity,
    };

    console.log("✅ Dashboard data sent");
    res.json(dashboardData);

  } catch (error) {
    console.error("❌ Dashboard Error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};
