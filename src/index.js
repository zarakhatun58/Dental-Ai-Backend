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



dotenv.config();

const app = express();

app.use(cors());
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
