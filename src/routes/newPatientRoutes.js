// routes/patientRoutes.js
import express from "express";
import mysql from "mysql2/promise";

const router = express.Router();



router.get("/ai-insights", async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
 const [rows] = await connection.execute(`
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
      ORDER BY lastVisit DESC;
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
        riskLevel: daysSince > 180 ? "high" : daysSince > 90 ? "medium" : "low",
        phone: p.phone?.trim() || "",
        email: p.email?.trim() || "",
        noShowProbability: Math.floor(Math.random() * 100), // AI mock
        upsellPotential: [
          "Crown ($2,400)", "Whitening ($450)", "Veneers ($3,200)", "Sealants ($180)", "Implant ($4,500)"
        ][Math.floor(Math.random() * 5)],
        insuranceStatus: [
          "Active", "Expired", "Pending", "None"
        ][Math.floor(Math.random() * 4)]
      };
    });


   res.json({ patients })
  } catch (err) {
    console.error("Error loading patients:", err.message);
    res.status(500).json({ error: "Failed to fetch patients." });
  }
});


export default router;
