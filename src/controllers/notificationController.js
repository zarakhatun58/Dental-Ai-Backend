// src/controllers/notificationController.js
import pool from '../config/db.js';
import { sendAndStoreNotification } from '../utils/sendNotification.js';

// export const notifyNow = async (req, res) => {
//   const { userId, title, message, type } = req.body;

//   if (!userId || !title || !message) {
//     return res.status(400).json({ message: "Missing fields" });
//   }

//   try {
//     // emit via socket
//     await sendAndStoreNotification({ userId, title, message, type });

//     // optional: save to database
//     await pool.query(
//       `INSERT INTO notifications (user_id, title, message, type, read_status) VALUES (?, ?, ?, ?, 0)`,
//       [userId, title, message, type || 'info']
//     );

//     res.status(200).json({ message: "Notification sent" });
//   } catch (err) {
//     console.error("Notification error:", err);
//     res.status(500).json({ message: "Failed to send notification" });
//   }
// };

export const notifyNow = async (req, res) => {
  const { userId, title, message, type } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    // Send notification (handles DB + socket)
    await sendAndStoreNotification({ userId, title, message, type });

    res.status(200).json({ message: "Notification sent" });
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ message: "Failed to send notification" });
  }
};

export const getUserNotifications = async (req, res) => {
  const userId = req.params.userId;
  const [rows] = await pool.query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  res.json(rows);
};

export const markAsRead = async (req, res) => {
  const id = req.params.id;
  await pool.query(`UPDATE notifications SET read_status = 1 WHERE id = ?`, [id]);
  res.json({ message: "Marked as read" });
};

export const markAllAsRead = async (req, res) => {
  const userId = req.params.userId;
  await pool.query(`UPDATE notifications SET read_status = 1 WHERE user_id = ?`, [userId]);
  res.json({ message: "All marked as read" });
};
