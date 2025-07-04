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
import campaignRoutes from "./routes/campaignRoutes.js";
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


dotenv.config();

const app = express();

app.use(cors({
  origin: ["https://dental-flow-ai-agent.lovable.app/"],
  methods: ["POST"],
}));
app.use(express.json());

// ✅ Mount routes first
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/campaigns", campaignRoutes)
app.use("/api/payments", paymentRoutes);
app.use("/api/outreach", outreachRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/clinics", clinicRoutes);
//gemini
app.use("/api/gemini", geminiRoutes);
app.use('/api/appointmentsNew', appointmentApi);
app.use("/api/patientsNew", patientRoutesNew);
app.use('/api', slotRoutes);
app.use('/api', alertRoutes);
app.use("/api", bookingRoutes);
app.use("/api", chairRoutes);
app.use("/api", hygienistRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stripe', stripeRoutes); 

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
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error", err);
  });

export default app;
