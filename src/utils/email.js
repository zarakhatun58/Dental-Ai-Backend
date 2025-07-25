import nodemailer from "nodemailer";
import dotenv from "dotenv";
import pool from "../config/db.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: parseInt(process.env.EMAIL_PORT || "587") === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  if (!to || !subject || !html) {
    console.warn("❌ Missing email fields");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"DentalAI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", info.messageId);

    // ✅ Log to DB
    await pool.execute(
  "INSERT INTO email_log (to_email, subject, message, status) VALUES (?, ?, ?, ?)",
  [to, subject, html, "sent"]
);

  } catch (error) {
    console.error("❌ Error sending email:", error.message);

    // ❌ Log failure to DB
    await pool.execute(
      "INSERT INTO email_log (to_email, subject, message, status) VALUES (?, ?, ?, ?)",
      [to, subject, html, "failed"]
    );
  }
};