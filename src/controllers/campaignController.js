// controllers/campaignController.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import pool from "../config/db.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// GET all campaigns
export const getAllCampaigns = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM campaigns ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// POST create a new campaign
// export const createCampaign = async (req, res) => {
//   try {
//     const { name, type, targeting, discount, autoGenerate, tone = "friendly", segment = "at-risk patients" } = req.body;

//     let generatedMessage = null;

//     if (autoGenerate) {
//       const prompt = `
//         You are a dental marketing assistant.
//         Write a short, ${tone} SMS + Email campaign message to re-engage this segment:
//         Segment: ${segment}
//         Offer: ${discount || "no discount"}

//         Be concise and professional.
//       `;

//       try {
//         const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });  
//         const result = await model.generateContent(prompt);
//         generatedMessage = result.response.text().trim();
//       } catch (aiErr) {
//         console.error("🧠 AI Message Generation Error:", aiErr.message);
//       }
//     }

//     const [result] = await pool.query(
//       `INSERT INTO campaigns (name, type, status, targeting, sent, opened, responded, booked, revenue, discount)
//        VALUES (?, ?, 'scheduled', ?, 0, 0, 0, 0, '$0', ?)`,
//       [name, type, targeting, discount]
//     );

//     const [newCampaign] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [result.insertId]);

//     res.status(201).json({
//       ...newCampaign[0],
//       autoMessage: generatedMessage, // add it to response (optional: store in DB)
//     });

//   } catch (err) {
//     res.status(500).json({ error: 'Failed to create campaign', details: err.message });
//   }
// };

export const createCampaign = async (req, res) => {
  try {
    const { name, type, targeting, discount, autoGenerate, tone, segment } = req.body;

    let message = "";
    if (autoGenerate) {
      // Construct prompt using tone + segment
      const prompt = `Generate a ${tone} SMS or email message targeting ${segment} with offer: "${discount}".`;
      message = await generateAIInsight({ prompt });
    }

    const [result] = await pool.query(
      `INSERT INTO campaigns (name, type, status, targeting, sent, opened, responded, booked, revenue, discount, message)
       VALUES (?, ?, 'scheduled', ?, 0, 0, 0, 0, '$0', ?, ?)`,
      [name, type, targeting, discount, message]
    );

    const [newCampaign] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [result.insertId]);
    res.status(201).json(newCampaign[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create campaign', details: err.message });
  }
};
// PUT update campaign status
export const updateCampaign = async (req, res) => {
  const { id } = req.params;
  const { status, message } = req.body;

  try {
    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (message !== undefined) {
      updates.push('message = ?');
      values.push(message);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    const [result] = await pool.query(
      `UPDATE campaigns SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const [updated] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update campaign', details: err.message });
  }
};

// POST duplicate campaign
export const duplicateCampaign = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [id]);
    const original = rows[0];
    if (!original) return res.status(404).json({ error: 'Campaign not found' });

    const [result] = await pool.query(
      `INSERT INTO campaigns (name, type, status, targeting, sent, opened, responded, booked, revenue, discount)
       VALUES (?, ?, 'scheduled', ?, 0, 0, 0, 0, '$0', ?)`,
      [`${original.name} (Copy)`, original.type, original.targeting, original.discount]
    );

    const [newCopy] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [result.insertId]);
    res.status(201).json(newCopy[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to duplicate campaign', details: err.message });
  }
};

export const regenerateMessage = async (req, res) => {
  const { id } = req.params;
  const { tone = "friendly", segment = "at-risk patients" } = req.body;

  try {
    const prompt = `Write a ${tone} dental marketing message targeting ${segment}. 
The message should be concise, persuasive, and suitable for email or SMS.`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const message = response.text().trim();

    // await pool.query('UPDATE campaigns SET message = ? WHERE id = ?', [message, id]);
    await pool.query('UPDATE campaigns SET message = ?, ai_prompt = ? WHERE id = ?', [message, prompt, id]);

    console.log("Inserting history for campaign ID:", id);
    await pool.query(
      'INSERT INTO message_history (campaign_id, message, tone, segment) VALUES (?, ?, ?, ?)',
      [id, message, tone, segment]
    );
    console.log("✅ Inserted message into history for campaign ID:", id);

    const [updated] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error("🔥 Gemini Error:", err);
    res.status(500).json({ error: "Failed to regenerate message", details: err.message });
  }
};
// DELETE campaign
export const deleteCampaign = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM campaigns WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.status(204).send(); // 204 No Content
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete campaign', details: err.message });
  }
};

export const getMessageHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const [history] = await pool.query(
      'SELECT * FROM message_history WHERE campaign_id = ? ORDER BY created_at DESC',
      [id]
    );
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch message history' });
  }
};


export default {
  getAllCampaigns,
  createCampaign,
  updateCampaign,
  duplicateCampaign,
  regenerateMessage,
  deleteCampaign,
  getMessageHistory,
};
