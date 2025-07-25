import express from "express";
import pool from "../config/db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
const router = express.Router();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/message', async (req, res) => {
  const { id, text, type = 'text', sender = 'user' } = req.body;

  if (!text || !id) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const timestamp = new Date();

    // Save user message to livechat
    await pool.execute(
      'INSERT INTO livechat (id, text, type, sender, timestamp) VALUES (?, ?, ?, ?, ?)',
      [id, text, type, sender, timestamp]
    );

    // Generate response from Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(text);
    const botText = result.response.text();
    const botId = `${id}-bot`;
    const botTimestamp = new Date();

    // Save bot response to livechat
    await pool.execute(
      'INSERT INTO livechat (id, text, type, sender, timestamp) VALUES (?, ?, ?, ?, ?)',
      [botId, botText, 'text', 'bot', botTimestamp]
    );

    res.json({ response: botText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
