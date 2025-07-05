import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../config/db.js';
import { sendNotification } from '../utils/sendNotification.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch metrics from MySQL
    const [metrics] = await pool.query(
      "SELECT * FROM dashboard_metrics WHERE user_id = ?",
      [userId]
    );

    if (!metrics || metrics.length === 0) {
      return res.status(404).json({ message: "No dashboard data found." });
    }

    // Generate Gemini insight
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // const prompt = `Analyze the following dental clinic metrics and give actionable suggestions:\n\n${JSON.stringify(metrics[0])}`;
    // const result = await model.generateContent(prompt);
    // const geminiInsight = result.response.text();

    // Static dashboard additions
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
      console.log("⚠️ No data in DB, returning fallback data");
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
        recentActivity: [
          {
            type: "booking",
            message: "AI booked Sarah M. for cleaning (high upsell probability)",
            time: "2 min ago",
            priority: "high"
          },
          {
            type: "payment",
            message: "$89 pre-payment received from John D.",
            time: "5 min ago",
            priority: "medium"
          },
          {
            type: "campaign",
            message: "Sent discount offers to 23 at-risk patients",
            time: "15 min ago",
            priority: "medium"
          },
          {
            type: "prediction",
            message: "Flagged 3 patients as no-show risks for tomorrow",
            time: "1 hour ago",
            priority: "high"
          }
        ]
      });
    }
    let geminiInsight = "No AI insights available";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze the following dental metrics:\n${JSON.stringify(metrics[0])}`;
      const result = await model.generateContent(prompt);
      geminiInsight = result.response.text();
    } catch (e) {
      console.warn("⚠️ Gemini failed, skipping insight:", e.message);
    }
    // Merge DB metrics with AI insight and activity
    const dashboardData = {
      ...metrics[0],
      geminiInsight,
      recentActivity,
    };

    res.json(dashboardData);
    console.log(dashboardData);
    await sendNotification({
      user_id: req.userId,
      title: "Dashboard Accessed",
      type: "dashboard",
      context: `User accessed the dashboard on ${new Date().toLocaleString()}.`
    });

  } catch (error) {
    console.error("Dashboard Error:", error.message);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};
