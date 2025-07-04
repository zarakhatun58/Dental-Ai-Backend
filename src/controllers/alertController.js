import pool from '../config/db.js';
import genAI from '../lib/geminiClient.js';

export const getAlertsByDate = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Date is required" });

  try {
    const [appointments] = await pool.query(`
      SELECT
        a.AptNum AS id,
        TIME(a.AptDateTime) AS time,
        o.OpName AS chair,
        a.ProcDescript AS type,
        p.FName, p.LName,
        COALESCE(p.WirelessPhone, p.HmPhone, p.WkPhone) AS phone,
        p.Email
      FROM appointment a
      JOIN patient p ON a.PatNum = p.PatNum
      JOIN operatory o ON a.Op = o.OperatoryNum
      WHERE DATE(a.AptDateTime) = ?
    `, [date]);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // ✅ correct model name (no "models/" prefix)

    const alerts = [];

    for (const apt of appointments) {
      const fullName = `${apt.FName} ${apt.LName}`;
      const time = apt.time;
      const type = apt.type || "cleaning";

      // === 1. No-Show Risk Analysis ===
      const noShowPrompt = `
        A patient named ${fullName} is scheduled at ${time} for ${type}.
        Contact: phone=${apt.phone}, email=${apt.Email}.
        Estimate no-show probability (high/medium/low) and confidence %.
        Respond only in format: "[RISK_LEVEL] - [CONFIDENCE]%"
      `;

      try {
        const noShowRes = await model.generateContent({
          contents: [{
            role: "user",
            parts: [{ text: noShowPrompt }]
          }]
        });

        const noShowText = await noShowRes.response.text();
        const [riskLevelRaw, confidenceRaw] = noShowText.split('-').map(s => s.trim());
        const riskLevel = riskLevelRaw.toLowerCase();
        const confidence = confidenceRaw?.replace('%', '');

        if (riskLevel === 'high' || riskLevel === 'medium') {
          alerts.push({
            type: "no-show-risk",
            message: `No-show risk: ${fullName} (${time}) - ${confidence}% probability`,
            action: "Consider double-booking",
            priority: riskLevel === 'high' ? 'high' : 'medium',
          });
        }
      } catch (err) {
        console.warn(`Gemini no-show risk failed for ${fullName}:`, err.message);
      }

      // === 2. Upsell Opportunity Analysis ===
      const upsellPrompt = `
        A patient named ${fullName} is booked for "${type}" at ${time}.
        Based on procedure type, name, and contact info (phone: ${apt.phone}, email: ${apt.Email}),
        is there an upsell opportunity like whitening or crowns?

        Respond with either:
        - "yes: [short opportunity reason]"
        - "no"
      `;

      try {
        const upsellRes = await model.generateContent({
          contents: [{
            role: "user",
            parts: [{ text: upsellPrompt }]
          }]
        });

        const upsellText = await upsellRes.response.text();
        const lower = upsellText.toLowerCase();

        if (lower.startsWith("yes")) {
          alerts.push({
            type: "upsell",
            message: `Upsell opportunity: ${fullName} (${time}) - ${upsellText.replace('yes:', '').trim()}`,
            action: "Prepare materials or script",
            priority: "medium"
          });
        }
      } catch (err) {
        console.warn(`Gemini upsell failed for ${fullName}:`, err.message);
      }
    }

    res.json(alerts);
  } catch (err) {
    console.error("Failed to fetch alerts:", err);
    res.status(500).json({ error: "Alert generation failed", details: err.message });
  }
};
