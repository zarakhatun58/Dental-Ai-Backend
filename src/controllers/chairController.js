import pool from "../config/db.js";
import { sendAndStoreNotification } from "../utils/sendNotification.js";

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
    await sendAndStoreNotification({
     userId: req.userId,
      title: "Empty Chairs Alert",
      type: "chairs",
      message: `There are currently ${chairs.length} unbooked chairs. Consider launching a recall campaign.`
    });
  } catch (err) {
    console.error("Error fetching chairs:", err.message);
    res.status(500).json({ error: "Failed to fetch chairs" });
  }
};


/*If you plan to track chair usage, you might consider a related table like:

sql
Copy
Edit
CREATE TABLE operatory_schedule (
  ScheduleId INT AUTO_INCREMENT PRIMARY KEY,
  OperatoryNum INT,
  HygienistId INT,
  AppointmentStart DATETIME,
  AppointmentEnd DATETIME,
  FOREIGN KEY (OperatoryNum) REFERENCES operatory(OperatoryNum)
);
This allows tracking which chair is booked when and by whom.
*/