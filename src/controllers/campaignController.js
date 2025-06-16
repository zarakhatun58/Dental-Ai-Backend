import twilio from "twilio";
import Campaign from "../models/campaign.js";
import { sendSMS } from "../utils/sendSMS.js"; 

// ✅ Create campaign
export const createCampaign = async (req, res) => {
  try {
    const { title, message, audience, scheduledDate } = req.body;

    const campaign = new Campaign({ title, message, audience, scheduledDate });
    await campaign.save();

    res.status(201).json({ message: "Campaign created", campaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all campaigns
export const getAllCampaigns = async (_req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update campaign
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByIdAndUpdate(id, req.body, { new: true });

    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    res.status(200).json({ message: "Campaign updated", campaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete campaign
export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    res.status(200).json({ message: "Campaign deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// export const sendOutreach = async (req, res) => {
//   try {
//     const { patientIds, message } = req.body;

//     const patients = await Patient.find({ _id: { $in: patientIds } });

//     let smsSent = 0;
//     let emailSent = 0;

//     for (const p of patients) {
//       // Send SMS using Twilio
//       if (p.phone) {
//         try {
//           await twilioClient.messages.create({
//             body: message,
//             from: process.env.TWILIO_PHONE_NUMBER,
//             to: p.phone,
//           });
//           smsSent++;
//         } catch (err) {
//           console.error(`❌ SMS failed for ${p.phone}:`, err.message);
//         }
//       }

//       // Send Email using SendGrid
//       if (p.email) {
//         try {
//           await sgMail.send({
//             to: p.email,
//             from: process.env.EMAIL_FROM,
//             subject: "We Miss You at Our Dental Clinic!",
//             text: message,
//           });
//           emailSent++;
//         } catch (err) {
//           console.error(`❌ Email failed for ${p.email}:`, err.message);
//         }
//       }
//     }

//     res.status(200).json({
//       message: `Outreach sent.`,
//       totalPatients: patients.length,
//       smsSent,
//       emailSent,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


export const sendOutreach = async (req, res) => {
  try {
    const { patientIds, message } = req.body;

    const patients = await Patient.find({ _id: { $in: patientIds } });
    const sentTo = [];

    for (const p of patients) {
      // ✅ SMS
      try {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: p.phone,
        });
      } catch (err) {
        console.error(`SMS to ${p.phone} failed:`, err.message);
      }

      // ✅ Email
      try {
        await transporter.sendMail({
          from: `"Dental Clinic" <${process.env.EMAIL_USER}>`,
          to: p.email,
          subject: "We Miss You! Book Your Appointment Today 🦷",
          text: message,
        });
        console.log(`✅ Email sent to ${p.email}`);
      } catch (err) {
        console.error(`Email to ${p.email} failed:`, err.message);
      }

      sentTo.push({ name: p.name, phone: p.phone, email: p.email });
    }

    res.status(200).json({
      message: `Outreach sent to ${sentTo.length} patients.`,
      patients: sentTo,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
