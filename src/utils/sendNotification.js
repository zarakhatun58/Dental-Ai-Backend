import pool from '../config/db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// export const sendNotification = async ({ user_id, title, message, type, context }) => {
//   try {
//     if (!user_id) {
//       console.warn("sendNotification skipped: user_id is missing");
//       return;
//     }

//     let finalMessage = message;

//     if (!message && context) {
//       const result = await geminiModel.generateContent([
//         `Generate a professional notification message for a ${type} event.`,
//         `Title: ${title}`,
//         `Context: ${context}`
//       ]);
//       const response = await result.response;
//       finalMessage = await response.text();
//     }

//     await pool.query(
//       'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
//       [user_id, title, finalMessage, type]
//     );
//   } catch (err) {
//     console.error("Notification error:", err);
//   }
// };

export const sendNotification = async ({ user_id, title, message, type, context }) => {
  try {
    if (!user_id) {
      console.warn("sendNotification skipped: user_id is missing");
      return;
    }

    if (!title || !type) {
      console.warn("sendNotification skipped: title or type missing");
      return;
    }

    const finalMessage = message || context || "";

    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [user_id, title, finalMessage, type]
    );

    console.log(`✅ Notification sent to user ${user_id}: ${title}`);
  } catch (err) {
    console.error("❌ Notification error:", err);
  }
};
