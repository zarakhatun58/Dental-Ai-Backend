import Appointment from '../models/appointment.js';

// Add new appointment
export const addAppointment = async (req, res) => {
  try {
    const { patient, doctor, appointmentDate, reason } = req.body;

    const newAppointment = new Appointment({
      patient,
      doctor,
      appointmentDate,
      reason,
    });

    await newAppointment.save();
    res.status(201).json({ message: "Appointment booked", appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all appointments
export const getAllAppointments = async (_req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email phone")
      .sort({ appointmentDate: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Appointment.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment updated", appointment: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
