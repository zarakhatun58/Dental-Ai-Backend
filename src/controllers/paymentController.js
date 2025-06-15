import Payment from "../models/patient.js";
import Patient from "../models/patient.js";

// ✅ Create payment
export const createPayment = async (req, res) => {
  try {
    const { patient, amount, method, status, notes } = req.body;

    const existingPatient = await Patient.findById(patient);
    if (!existingPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const payment = new Payment({
      patient,
      amount,
      method,
      status,
      notes,
    });

    await payment.save();
    res.status(201).json({ message: "Payment recorded", payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all payments
export const getAllPayments = async (_req, res) => {
  try {
    const payments = await Payment.find().populate("patient").sort({ date: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndUpdate(id, req.body, { new: true });

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.status(200).json({ message: "Payment updated", payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.status(200).json({ message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
