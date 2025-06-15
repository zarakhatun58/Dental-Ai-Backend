import Patient from "../models/patient.js";

export const sendOutreach = async (req, res) => {
  try {
    const { patientIds, message } = req.body;

    const patients = await Patient.find({ _id: { $in: patientIds } });

    patients.forEach((patient) => {
      console.log(`📩 SMS to ${patient.phone}: ${message}`);
      console.log(`📧 Email to ${patient.email}: ${message}`);
    });

    res.status(200).json({
      message: `Outreach sent to ${patients.length} patients.`,
      patients: patients.map((p) => ({ name: p.name, phone: p.phone, email: p.email })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
