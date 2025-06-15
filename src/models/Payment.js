import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["cash", "card", "upi", "insurance"],
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "paid",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: String,
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
