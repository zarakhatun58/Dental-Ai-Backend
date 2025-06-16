import Doctor from "../models/doctor.js";

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createDoctor = async (req, res) => {
  try {
    const { name, specialty, email, phone } = req.body;
    const image = req.file ? `/uploads/doctors/${req.file.filename}` : "";

    const newDoctor = new Doctor({
      name,
      specialty,
      email,
      phone,
      image,
    });

    await newDoctor.save();
    res.status(201).json({ message: "Doctor created", doctor: newDoctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const result = await Doctor.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Doctor not found" });
    res.json({ message: "Doctor deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
