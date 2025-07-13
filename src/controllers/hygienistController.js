import pool from "../config/db.js";
import { sendAndStoreNotification } from "../utils/sendNotification.js";

export const getHygienists = async (req, res) => {
  try {
    const userId = req.user?.id; // use authenticated user if available
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const [hygienists] = await pool.query(`
      SELECT ProvNum AS id, CONCAT(FName, ' ', LName) AS name
      FROM provider
      WHERE IsHidden = 0 AND IsHygienist = 1
    `);

    res.status(200).json(
      hygienists.map(h => ({ id: h.id, label: h.name }))
    );

    await sendAndStoreNotification({
      userId,
      title: "Hygienist Availability Updated",
      type: "hygienists",
      message: `${hygienists.length} hygienist(s) are currently available.`
    });

  } catch (err) {
    console.error("Error fetching hygienists:", err.message);
    res.status(500).json({ error: "Failed to fetch hygienists" });
  }
};
