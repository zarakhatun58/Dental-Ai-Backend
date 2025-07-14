import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// export const sendSMS = async (to, body) => {
//   try {
//     const message = await client.messages.create({
//       body,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to,
//     });
//     console.log("✅ SMS sent:", message.sid);
//   } catch (error) {
//     console.error("❌ Error sending SMS:", error.message);
//   }
// };

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error("❌ Missing Twilio config in .env");
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const sendSMS = async (to, body) => {
  if (!to || !body) {
    console.warn("❌ Missing SMS fields");
    return;
  }

  try {
    const message = await client.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to: to.startsWith("+") ? to : `+1${to}`, // auto-add country code if needed
    });

    console.log("✅ SMS sent:", message.sid);
  } catch (error) {
    console.error("❌ Error sending SMS:", error.message);
  }
};