
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from './../config/db.js';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
  const { user_id, title, message, type, context } = req.body;

  try {
    let finalMessage = message;

    // If no custom message is provided, generate it using Gemini
    if (!message && context) {
      const result = await geminiModel.generateContent([
        `Generate a professional notification message for a ${type} event.`,
        `Title: ${title}`,
        `Context: ${context}`
      ]);

      const response = await result.response;
      finalMessage = await response.text();
    }

    pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [user_id, title, finalMessage, type],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ id: result.insertId, message: finalMessage });
      }
    );
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Failed to generate message with Gemini." });
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
