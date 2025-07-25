import twilio from "twilio";
import dotenv from "dotenv";
import pool from "../config/db.js";
import libPhoneNumber from "google-libphonenumber";

dotenv.config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error("❌ Missing Twilio config in .env");
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
const PhoneNumberFormat = libPhoneNumber.PhoneNumberFormat;

export const formatToE164 = (input, defaultRegion = "US") => {
  try {
    const number = phoneUtil.parseAndKeepRawInput(input, defaultRegion);
    if (phoneUtil.isValidNumber(number)) {
      return phoneUtil.format(number, PhoneNumberFormat.E164);
    }
  } catch (err) {
    console.error("📵 Invalid phone number:", input, err.message);
  }
  return null;
};

export const sendSMS = async (to, body) => {
 const formattedPhone = formatToE164(to);

  if (!formattedPhone || !body) {
    console.warn("❌ Missing or invalid SMS fields");
    return;
  }

  try {
    const message = await client.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log("✅ SMS sent:", message.sid);

    await pool.query(
      `INSERT INTO sms_log (phone, message, status, sent_at) VALUES (?, ?, ?, NOW())`,
      [formattedPhone, body, "sent"]
    );

    return message.sid;
  } catch (error) {
    console.error("❌ SMS send error:", error.message);

    await pool.query(
      `INSERT INTO sms_log (phone, message, status, sent_at, error_message) VALUES (?, ?, ?, NOW(), ?)`,
      [formattedPhone, body, "failed", error.message]
    );
  }
};
