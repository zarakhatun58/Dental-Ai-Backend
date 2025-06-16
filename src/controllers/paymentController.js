import Stripe from 'stripe';
import Patient from "../models/patient.js";  

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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  const { patientId, email } = req.body;

  if (!patientId || !email) {
    return res.status(400).json({ error: 'patientId and email are required' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Dental Cleaning',
            },
            unit_amount: 5000, // $50.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/payment-success',
      cancel_url: 'http://localhost:3000/payment-cancelled',
      metadata: {
        patientId,
      },
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
