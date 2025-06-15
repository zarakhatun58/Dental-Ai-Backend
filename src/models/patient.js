import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  lastVisit: { type: Date, default: null },
  noShowCount: { type: Number, default: 0 },
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
