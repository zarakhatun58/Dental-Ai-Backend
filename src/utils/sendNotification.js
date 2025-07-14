import pool from "../config/db.js";
import { getIO } from "../config/socket.js";



// export const sendNotification = async ({ userId, title, message, type }) => {
//   const [result] = await pool.query(
//     `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
//     [userId, title, message, type]
//   );

//   const notification = {
//     id: result.insertId,
//     user_id: userId,
//     title,
//     message,
//     type,
//     read_status: 0,
//     created_at: new Date(),
//   };

//   const io = getIO();
//   io.to(userId.toString()).emit("new_notification", notification);
//   console.log(`📢 Notification emitted to user ${userId}: ${title}`);
// };

export const sendAndStoreNotification = async ({ userId, title, message, type = "system" }) => {
  if (!userId || !title || !message) {
    throw new Error("Missing required notification fields");
  }

  // Ensure userId is an integer
  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    throw new Error(`Invalid userId: must be a number. Received: ${userId}`);
  }

  try {
    // Save to DB
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, read_status, created_at)
       VALUES (?, ?, ?, ?, 0, NOW())`,
      [parsedUserId, title, message, type]
    );

    // Emit via socket
    const io = getIO();
    io.to(String(parsedUserId)).emit("notification", {
      title,
      message,
      type,
      created_at: new Date().toISOString(),
      read_status: 0,
    });
  } catch (err) {
    console.error("❌ sendAndStoreNotification error:", err.message);
    throw err;
  }
};
// export const sendAndStoreNotification = async ({ userId, title, message, type = "system" }) => {
//   if (!userId || !title || !message) throw new Error("Missing fields");

//   // Store in DB
//   await pool.query(
//     `INSERT INTO notifications (user_id, title, message, type, read_status, created_at)
//      VALUES (?, ?, ?, ?, 0, NOW())`,
//     [userId, title, message, type]
//   );

//   // Emit over socket
//   const io = getIO();
//   io.to(String(userId)).emit("notification", {
//     title,
//     message,
//     type,
//     created_at: new Date().toISOString(),
//     read_status: 0,
//   });
// };