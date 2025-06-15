import mongoose from "mongoose";

const OutreachSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  message: String,
  sentAt: { type: Date, default: Date.now },
});
