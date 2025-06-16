export const getAvailability = async (req, res) => {
  try {
    const { start, end } = req.query;

    // Validate dates
    if (!start || !end) {
      return res.status(400).json({ error: "Start and end dates required" });
    }

    // Simulated availability data (replace with real DB logic)
    const availableSlots = [
      { date: start, slots: ["10:00", "11:00", "14:00"] },
      { date: end, slots: ["09:00", "13:00"] },
    ];

    res.json({ availability: availableSlots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
