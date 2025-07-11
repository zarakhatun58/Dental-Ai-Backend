import Patient from '../models/patient.js';

// ✅ Create/Add a new patient
// export const addPatient = async (req, res) => {
//   try {
//     const { name, email, phone, lastVisit } = req.body;

//     const existingPatient = await Patient.findOne({ email });
//     if (existingPatient) {
//       return res.status(400).json({ message: 'Patient already exists' });
//     }

//     const newPatient = new Patient({ name, email, phone, lastVisit });
//     await newPatient.save();

//     res.status(201).json({ message: 'Patient added successfully', patient: newPatient });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
export const addPatient = async (req, res) => {
  try {
    let { name, email, phone,gender, age, address, lastVisit } = req.body;

    // Ensure phone number starts with country code (e.g., +91 for India)
    if (!phone.startsWith('+')) {
      phone = '+91' + phone; // You can make this dynamic per region if needed
    }

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient already exists' });
    }

    const newPatient = new Patient({ name, email, phone,gender, age, address, lastVisit });
    await newPatient.save();

    res.status(201).json({ message: 'Patient added successfully', patient: newPatient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get all patients
export const getAllPatients = async (_req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update a patient by ID
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPatient = await Patient.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ message: 'Patient updated', patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete a patient by ID
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPatient = await Patient.findByIdAndDelete(id);

    if (!deletedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ message: 'Patient deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get patients who haven't visited in the last 6 months
export const getLapsedPatients = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const lapsedPatients = await Patient.find({ lastVisit: { $lt: sixMonthsAgo } });
    res.status(200).json(lapsedPatients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get patients with noShowCount >= threshold (e.g., 2 or more no-shows)
export const getHighNoShowPatients = async (req, res) => {
  try {
    const { threshold = 2 } = req.query;

    const frequentNoShows = await Patient.find({
      noShowCount: { $gte: Number(threshold) }
    });

    res.status(200).json(frequentNoShows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

