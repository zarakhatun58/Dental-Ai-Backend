import pool from "../config/db.js";
import { sendNotification } from "../utils/sendNotification.js";

export const getHygienists = async (req, res) => {
    try {
         const userId = req.params.userId;
        const [hygienists] = await pool.query(`
      SELECT ProvNum AS id, CONCAT(FName, ' ', LName) AS name
      FROM provider
      WHERE IsHidden = 0
    `);

        
        res.status(200).json(
            hygienists.map(hygienist => ({
                id: hygienist.id,
                label: hygienist.name
            }))
        );
        await sendNotification({
         userId: req.userId,
            title: "Hygienist Availability Updated",
            type: "hygienists",
            context: `New availability has been added for hygienist .`
        });

    } catch (err) {
        console.error("Error fetching hygienists:", err.message);
        res.status(500).json({ error: "Failed to fetch hygienists" });
    }
};
