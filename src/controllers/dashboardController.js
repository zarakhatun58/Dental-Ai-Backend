// controllers/dashboardController.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// export const getDashboardData = async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     // Sample query — customize to your schema
//     const [metrics] = await pool.query(
//       'SELECT * FROM dashboard_metrics WHERE user_id = ?',
//       [userId]
//     );

//     const [activities] = await pool.query(
//       'SELECT * FROM dashboard_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
//       [userId]
//     );

//     res.json({
//       metrics,
//       recentActivity: activities
//     });
//   } catch (error) {
//     console.error("Dashboard error:", error);
//     res.status(500).json({ error: 'Failed to fetch dashboard data' });
//   }
// };

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch key metrics from MySQL
    const [metrics] = await db.query(
      "SELECT * FROM dashboard_metrics WHERE user_id = ?",
      [userId]
    );

    // Optional: Fallback if no data
    if (!metrics || metrics.length === 0) {
      return res.status(404).json({ message: "No dashboard data found." });
    }

    // Use Gemini to generate insight
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze the following dental clinic metrics and give actionable suggestions:\n\n${JSON.stringify(metrics)}`;
    const result = await model.generateContent(prompt);
    const geminiInsight = result.response.text();

    res.json({
      metrics,
      geminiInsight
    });
  } catch (error) {
    console.error("Dashboard Error:", error.message);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};