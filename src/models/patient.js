import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
   gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  lastVisit: { type: Date, default: null },
  noShowCount: { type: Number, default: 0 },
  flagged: {
    type: Boolean,
    default: false,
  },
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
