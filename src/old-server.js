import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import patientRoutes from "./routes/patientRoutes.js";
import authRoutes from "./routes/authRoutes.js";
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
import patientRoutesNew from './routes/newPatientRoutes.js'
import slotRoutes from './routes/slotRoutes.js'
import alertRoutes from './routes/alertRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import chairRoutes from './routes/chairRoutes.js'
import hygienistRoutes from './routes/hygienistRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import stripeRoutes from './routes/stripeRoutes.js'
import successRoutes from './routes/successRoutes.js'
import promoRoutes from './routes/promoRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import recomRoutes from './routes/recomRoutes.js'
import authMiddleware from "./middleware/authMiddleware.js";


dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:8080', // local frontend
  'https://dental-flow-ai-agent.lovable.app/', // deployed frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ CORS blocked: Not allowed by server'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cors(corsOptions));
// app.use(cors());
app.use(express.json());

// ✅ Mount routes first
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use("/api/analytics", analyticsRoutes);
// app.use("/api/campaigns", campaignRoutes)
app.use("/api/payments", paymentRoutes);
app.use("/api/outreach", outreachRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/clinics", clinicRoutes);
//gemini
app.use("/api/gemini", geminiRoutes);
app.use('/api/appointmentsNew', authMiddleware,appointmentApi);
app.use("/api/patientsNew",authMiddleware, patientRoutesNew);
app.use('/api', authMiddleware,slotRoutes);
app.use('/api', authMiddleware,alertRoutes);
app.use("/api", authMiddleware,bookingRoutes);
app.use("/api", authMiddleware,chairRoutes);
app.use("/api", authMiddleware,hygienistRoutes);
app.use('/api/transactions', authMiddleware,transactionRoutes);
app.use('/api/stripe',authMiddleware,stripeRoutes); 
app.use('/api', promoRoutes ); 
app.use('/api/notification', notificationRoutes ); 
app.use('/api/dashboard', dashboardRoutes ); 
app.use('/api/ai', authMiddleware,recomRoutes ); 
app.use('/api/campaigns', authMiddleware,campRoutes);



// app.use('/uploads', express.static('uploads'));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@dental-ai.fsi3q7c.mongodb.net/`;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.get("/", (req, res) => {
      res.send("Backend is running on Render 🚀");
    });
    app.post('/api/gemini', async (req, res) => {
  const prompt = req.body.prompt;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  res.json(data);
});
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("✅ FRONTEND_URL:", `${process.env.FRONTEND_URL}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error", err);
  });

export default app;
