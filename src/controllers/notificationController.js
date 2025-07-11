
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from './../config/db.js';




export const getNotifications = (req, res) => {
  const { userId } = req.params;
  pool.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }     
  );
};


export const addNotification = async (req, res) => {
  let { user_id, userId, title, message, type, context } = req.body;

  console.log("🔍 Incoming req.body:", req.body); // ADD THIS
  const finalUserId = userId || user_id;

  if (!finalUserId) {
    console.warn("❌ sendNotification aborted — userId kshdksdh is missing or null.");
    return res.status(400).json({ error: "User ID is required." });
  }

  let finalMessage = message || context || "No message provided.";

  try {
    // Insert the notification into the database
    const [result] = await pool.query(
      "INSERT INTO notifications (user_id, title, message, type, context, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [finalUserId, title, finalMessage, type, context]
    );

    const notificationPayload = {
      id: result.insertId,
      user_id: finalUserId,
      title,
      message: finalMessage,
      type,
      context,
      read_status: 0,
      created_at: new Date(),
    };

    // Emit notification via socket
    try {
      const io = getIO();
      io.to(finalUserId.toString()).emit("new_notification", notificationPayload);
      console.log("📢 Notification emitted to user", finalUserId);
    } catch (socketErr) {
      console.error("🔥 Socket emit error:", socketErr);
    }

    res.status(201).json(notificationPayload);
  } catch (err) {
    console.error("❌ Notification error:", err);
    res.status(500).json({ error: "Failed to add notification." });
  }
};


export const markAsRead = (req, res) => {
  const { id } = req.params;
  pool.query('UPDATE notifications SET read_status = 1 WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Marked as read' });
  });
};

export const markAllAsRead = (req, res) => {
  const { userId } = req.params;
  pool.query(
    'UPDATE notifications SET read_status = 1 WHERE user_id = ?',
    [userId],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'All marked as read' });
    }
  );
};
