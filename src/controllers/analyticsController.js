import Patient from '../models/patient.js';
import Appointment from '../models/appointment.js';

export const getAnalytics = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const appointmentsThisMonth = await Appointment.find({
      appointmentDate: {
        $gte: new Date(`${currentYear}-${currentMonth + 1}-01`),
        $lt: new Date(`${currentYear}-${currentMonth + 2}-01`),
      },
    });

    const totalThisMonth = appointmentsThisMonth.length;

    const totalNoShows = await Patient.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$noShowCount" }
        }
      }
    ]);

    res.json({
      totalPatients,
      totalAppointments,
      appointmentsThisMonth: totalThisMonth,
      totalNoShowCount: totalNoShows[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNoShowAnalytics = async (req, res) => {
  const frequentNoShows = await Patient.find({ noShowCount: { $gte: 3 } });
  res.json({ frequentNoShows });
};
