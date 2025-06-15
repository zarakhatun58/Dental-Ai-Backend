import Payment from "../models/payment.js";  // ✅ Correct Payment model
import Patient from "../models/patient.js";  // ✅ Correct Patient model

// ✅ Create a new payment
export const createPayment = async (req, res) => {
  try {
    const { patient, amount, method, status, notes } = req.body;

    // Validate patient exists
    const existingPatient = await Patient.findById(patient);
    if (!existingPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Create payment
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
    const payments = await Payment.find()
      .populate("patient", "name email phone") // Optional: limit patient fields
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update a payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Payment.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ message: "Payment updated", payment: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete a payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Payment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
