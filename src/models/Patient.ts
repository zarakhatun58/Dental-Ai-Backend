import mongoose, { Document, Schema } from "mongoose";

export interface IPatient extends Document {
  name: string;
  email: string;
  phone: string;
  lastVisit: Date;
  noShowCount: number;
}

const patientSchema = new Schema<IPatient>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  lastVisit: { type: Date, default: null },
  noShowCount: { type: Number, default: 0 },
});

export const Patient = mongoose.model<IPatient>("Patient", patientSchema);
