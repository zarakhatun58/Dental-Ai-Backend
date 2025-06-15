import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: { type: String, enum: ['all', 'no-show', 'recent'], default: 'all' },
    scheduledDate: { type: Date, required: true },
    sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
