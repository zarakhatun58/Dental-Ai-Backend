// routes/geminiRoutes.js
import express from "express";
import axios from "axios";
import mysql from "mysql2/promise";

const router = express.Router();

router.post("/ask", async (req, res) => {
  console.log("Received POST /api/gemini/ask");

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const output = response.data;
    res.json(output);
  } catch (error) {
    console.error("Gemini API error:", error.message);
    res.status(500).json({ error: "Gemini API request failed." });
  }
});

router.post("/ai-suggestions", async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    const [appointments] = await connection.execute(
      "SELECT AptNum, PatNum, AptDateTime FROM appointment WHERE AptDateTime >= NOW() ORDER BY AptDateTime ASC LIMIT 5"
    );

    await connection.end();

    const prompt = `Here are upcoming dental appointments:\n${JSON.stringify(appointments, null, 2)}\n\nGive AI-powered insights: summarize, highlight anything important.`;

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    const text = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestions found.";
    res.json({ aiSuggestions: text });
  } catch (error) {
    console.error("Error fetching AI suggestions:", error.message);
    res.status(500).json({ error: "AI suggestion generation failed." });
  }
});

export default router;
