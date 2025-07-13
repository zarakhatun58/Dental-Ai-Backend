import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import http from "http";
// Middleware
import authMiddleware from "./middleware/authMiddleware.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import campRoutes from "./routes/campRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import outreachRoutes from "./routes/outreachRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import clinicRoutes from "./routes/clinicRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import appointmentApi from './routes/appointmentsNew.js';
import patientRoutesNew from './routes/newPatientRoutes.js';
import slotRoutes from './routes/slotRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import chairRoutes from './routes/chairRoutes.js';
import hygienistRoutes from './routes/hygienistRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import promoRoutes from './routes/promoRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import recomRoutes from './routes/recomRoutes.js';
import cookieParser from 'cookie-parser';
import { initSocket } from "./config/socket.js";


dotenv.config();
const app = express();
const server = http.createServer(app);

initSocket(server,app);



const allowedOrigins = [
  'http://localhost:8080',
  'https://dental-flow-ai-agent.lovable.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
       console.error(`❌ CORS blocked from origin: ${origin}`);
      callback(new Error('❌ CORS blocked: Not allowed by server'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser()); 

// ✅ Static assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// ✅ Base test route
app.get("/", (req, res) => {
  res.send("✅ Dental backend running (MySQL + Gemini API enabled)");
});

// ✅ Gemini test endpoint (optional)
app.post('/api/gemini', async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Gemini API error:", err.message);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

// ✅ Public routes (no auth)
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/outreach", outreachRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/promo", promoRoutes);
app.use('/api/notification', notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ important routes
app.use("/api/appointmentsNew", appointmentApi);
app.use("/api/patientsNew", patientRoutesNew);
app.use("/api",  slotRoutes);
app.use("/api", alertRoutes);
app.use("/api", bookingRoutes);
app.use("/api",  chairRoutes);
app.use("/api",  hygienistRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/stripe",  stripeRoutes);
app.use("/api/ai", recomRoutes);
app.use("/api/campaigns", campRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;


server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ Mode: MySQL + Gemini API + socket (MongoDB/Mongoose not used)");
});

export default app;
