import pool from "../config/db.js";
import { getIO } from "../config/socket.js";
import twilio from "twilio";
import nodemailer from 'nodemailer';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendReminder({ phone, email, subject, message }) {
  const results = {
    sms: null,
    email: null,
  };

  // Send SMS
  try {
    const smsResult = await client.messages.create({
      body: message,
      from: TWILIO_PHONE,
      to: phone,
    });

    results.sms = smsResult;
    await pool.execute(
      "INSERT INTO sms_log (phone, message, status) VALUES (?, ?, ?)",
      [phone, message, smsResult.status]
    );
  } catch (err) {
    console.error("❌ SMS failed:", err.message);
  }

  // Send Email
  try {
    const mailResult = await transporter.sendMail({
      from: `"Clinic Reminders" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject || "Appointment Reminder",
      text: message,
    });

    results.email = mailResult;
    await pool.execute(
      "INSERT INTO email_log (email, subject, message, status) VALUES (?, ?, ?, ?)",
      [email, subject, message, mailResult.accepted.length ? "sent" : "failed"]
    );
  } catch (err) {
    console.error("❌ Email failed:", err.message);
  }

  return results;
}

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