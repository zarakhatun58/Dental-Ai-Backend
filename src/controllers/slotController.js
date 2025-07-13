// controllers/slotsController.js
import pool from '../config/db.js';
import { format } from 'date-fns';
import genAI from '../lib/geminiClient.js';
import { sendAndStoreNotification } from '../utils/sendNotification.js';

const TIME_SLOTS = [
  "08:00:00", "08:30:00", "09:00:00", "09:30:00",
  "10:00:00", "10:30:00", "11:00:00", "11:30:00",
  "12:00:00", "12:30:00", "13:00:00", "13:30:00"
];

const formatTime = (dateStr, timeStr) => format(new Date(`${dateStr}T${timeStr}`), "h:mm a");

const mockRiskAnalysis = async (patientName) => {
  // Replace this with real Gemini API call later
  return patientName.toLowerCase().includes("no-show") ? "high" : "low";
};

// ✅ GET /api/slots?date=YYYY-MM-DD
export const getSlotsByDate = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Date is required" });

  try {
    const [chairs] = await pool.query(`SELECT OperatoryNum, OpName AS chair FROM operatory`);

 const [appointments] = await pool.query(`
  SELECT
    a.AptNum AS id,
    TIME(a.AptDateTime) AS time,
    DATE(a.AptDateTime) AS date,
    o.OpName AS chair,
    a.AptStatus AS status_raw,
    a.ProcDescript AS type,
    p.FName, p.LName,
    COALESCE(p.WirelessPhone, p.HmPhone, p.WkPhone) AS phone,
    p.Email
  FROM appointment a
  JOIN patient p ON a.PatNum = p.PatNum
  JOIN operatory o ON a.Op = o.OperatoryNum
  WHERE DATE(a.AptDateTime) = ?
`, [date]);


    const fullGrid = [];
    for (const { chair } of chairs) {
      for (const time of TIME_SLOTS) {
        const a = appointments.find(x => x.chair === chair && x.time === time);
        if (a) {
          const risk = await getRiskFromGemini(`${a.FName} ${a.LName}`, a.type, a.phone, a.Email);
          fullGrid.push({
            id: a.id,
            date,
            time: formatTime(date, time),
            chair,
            status: 'booked',
            patient: `${a.FName} ${a.LName}`,
            type: a.type || 'cleaning',
            phone: a.phone,
            email: a.Email,
            risk,
          });
        } else {
          fullGrid.push({ id: null, date, time: formatTime(date, time), chair, status: 'available', type: 'cleaning' });
        }
      }
    }

    res.json(fullGrid);
  } catch (err) {
    console.error("Slot fetch error:", err);
    res.status(500).json({ error: "Failed to fetch slots", details: err.message });
  }
};

// ✅ POST /api/slots/book
export const bookSlot = async (req, res) => {
  const { patientId, date, time, chair } = req.body;
  const userId = req.userId; // ✅ from auth middleware

  if (!patientId || !date || !time || !chair)
    return res.status(400).json({ error: "Missing required booking data" });

  try {
    const [existingBookings] = await pool.query(`
      SELECT * FROM appointment WHERE PatNum = ? AND DATE(AptDateTime) = ?
    `, [patientId, date]);

    if (existingBookings.length >= 2) {
      return res.status(400).json({ error: "Patient already has 2 bookings" });
    }

    const [slotCheck] = await pool.query(`
      SELECT * FROM operatory WHERE OpName = ?
    `, [chair]);

    if (slotCheck.length === 0) {
      return res.status(404).json({ error: "Chair not found" });
    }

    // TODO: Insert booking into OpenDental DB here (mock for now)

   

    res.json({
      message: "Slot booked successfully",
      slot: {
        patientId,
        date,
        time,
        chair,
        status: "booked",
      },
    });
 // ✅ Send notification
    // await sendAndStoreNotification({
    // userId: req.userId,
    //   title: 'Appointment Booked',
    //   message: `You booked a slot on ${date} at ${time} in chair ${chair}.`,
    //   type: 'booking',
    // });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Booking failed", details: err.message });
  }
};

export const getRiskFromGemini = async (fullName, type, phone, email) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    A dental patient named ${fullName} is booked for a procedure: "${type}".
    Contact info: phone=${phone}, email=${email}.
    Based on this info, determine the likelihood of no-show or risk level for this appointment.
    Respond with either: "high", "medium", or "low".
  `;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const response = await result.response.text();
    const text = response.toLowerCase();

    if (text.includes("high")) return "high";
    if (text.includes("medium")) return "medium";
    return "low";
  } catch (err) {
    console.error("Gemini error:", err.message);
    return "low";
  }
};



