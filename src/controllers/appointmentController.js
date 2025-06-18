import Appointment from '../models/appointment.js';

// // Add new appointment
// export const addAppointment = async (req, res) => {
//   try {
//     const { patient, doctor, appointmentDate, reason } = req.body;

//     const newAppointment = new Appointment({
//       patient,
//       doctor,
//       appointmentDate,
//       reason,
//     });

//     await newAppointment.save();
//     res.status(201).json({ message: "Appointment booked", appointment: newAppointment });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get all appointments
// export const getAllAppointments = async (_req, res) => {
//   try {
//     const appointments = await Appointment.find()
//       .populate("patient", "name email phone")
//       .sort({ appointmentDate: -1 });

//     res.status(200).json(appointments);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Update appointment
// export const updateAppointment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const updated = await Appointment.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });

//     if (!updated) {
//       return res.status(404).json({ message: "Appointment not found" });
//     }

//     res.status(200).json({ message: "Appointment updated", appointment: updated });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Delete appointment
// export const deleteAppointment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await Appointment.findByIdAndDelete(id);

//     if (!deleted) {
//       return res.status(404).json({ message: "Appointment not found" });
//     }

//     res.status(200).json({ message: "Appointment deleted" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

export const addAppointment = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      doctor,
      appointmentDate,
      time,
      reason,
    } = req.body;

    // Validation
    if (!name || !phone || !address || !doctor || !appointmentDate || !time || !reason) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newAppointment = new Appointment({
      name,
      phone,
      address,
      doctor,
      appointmentDate,
      time,
      reason,
    });

    await newAppointment.save();
    res.status(201).json({ message: "Appointment booked", appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all appointments
export const getAllAppointments = async (_req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctor", "name specialty")
      .sort({ appointmentDate: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update appointment
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

// ✅ Delete appointment
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

//book appointment
export const bookAppointment = async (req, res) => {
  const { name, phone, address, doctor, appointmentDate, time, reason } = req.body;

  console.log("Received Body:", req.body);
  if (!name || !phone || !address || !doctor || !appointmentDate || !time) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newAppointment = new Appointment({
      name,
      phone,
      address,
      doctor,
      appointmentDate,
      time,
      reason,
    });

    await newAppointment.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error while booking appointment" });
  }
};


export const markNoShow = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    appointment.status = "Cancelled";
    await appointment.save();

    const patient = await Patient.findById(appointment.patient);
    patient.noShowCount += 1;

    if (patient.noShowCount >= 3) {
      patient.flagged = true; // 🚩 Flag frequent no-shower
    }

    await patient.save();

    res.json({ message: "Marked as no-show", patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// export const bookAppointment = async (req, res) => {
//   try {
//     const { patient, doctor, appointmentDate, time, reason } = req.body;

//     // Check required fields
//    if (!patient || !doctor || !appointmentDate || !time) {
//   console.log({ patient, doctor, appointmentDate, time });
//   return res.status(400).json({ error: "All fields are required" });
// }


//     // Optional: check for conflict
//     const exists = await Appointment.findOne({ appointmentDate, time });
//     if (exists) {
//       return res.status(409).json({ error: "Slot already booked" });
//     }

//     // Create and save appointment
//     const appointment = new Appointment({
//       patient,
//       doctor,
//       appointmentDate,
//       time,
//       reason,
//     });

//     await appointment.save();

//     res.status(201).json({
//       message: "Appointment booked successfully",
//       appointment,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
