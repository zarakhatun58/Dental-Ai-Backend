import pool from '../config/db.js';
import { getIO } from "../config/socket.js";

export const sendNotification = async ({
  userId,
  title,
  message,
  type = "system",
  context = null,
}) => {
  try {
    const finalMessage = message || context || title;

    if (!userId) {
      console.warn("❌ sendNotification aborted — userId is missing or null.");
      return;
    }

    const [insertResult] = await pool.query(
      "INSERT INTO notifications (user_id, title, message, type, context, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [userId, title, finalMessage, type, context]
    );

    const notificationId = insertResult?.insertId;
    if (!notificationId) {
      console.warn("⚠️ Notification insert ID missing — skipping emit.");
      return;
    }

    let io;
    try {
      io = getIO();
    } catch (e) {
      console.warn("⚠️ Socket.IO not initialized — notification will not be emitted.");
      return;
    }

    setTimeout(() => {
      io.to(userId.toString()).emit("new_notification", {
        id: notificationId,
       userId: userId,
        title,
        message: finalMessage,
        type,
        context,
        created_at: new Date().toISOString(),
        read_status: 0,
      });
      console.log(`📢 Notification emitted to user ${userId}: ${title}`);
    }, 300);
  } catch (err) {
    console.error("❌ Failed to send notification:", err.message);
  }
};



