import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Missing Gemini API key in environment variables!");
  throw new Error("Missing Gemini API key");
} else {
  console.log("✅ GEMINI API key is loaded");
}

export default genAI;
