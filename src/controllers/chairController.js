import pool from "../config/db.js";
import { sendNotification } from "../utils/sendNotification.js";

export const getChairs = async (req, res) => {
  try {
     const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const [chairs] = await pool.query(
      `SELECT OperatoryNum AS id, OpName AS name FROM operatory`
    );
    
    res.status(200).json(
      chairs.map(chair => ({
        id: chair.id,
        name: chair.name
      }))
    );
    await sendNotification({
     userId: req.userId,
      title: "Empty Chairs Alert",
      type: "chairs",
      context: `There are currently ${emptyChairs} unbooked chairs. Consider launching a recall campaign.`
    });
  } catch (err) {
    console.error("Error fetching chairs:", err.message);
    res.status(500).json({ error: "Failed to fetch chairs" });
  }
};
