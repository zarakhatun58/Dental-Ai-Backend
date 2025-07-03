import pool from "../config/db.js";

export const getChairs = async (req, res) => {
  try {
    const [chairs] = await pool.query(
      `SELECT OperatoryNum AS id, OpName AS name FROM operatory`
    );

    res.status(200).json(
      chairs.map(chair => ({
        id: chair.id,
        name: chair.name
      }))
    );
  } catch (err) {
    console.error("Error fetching chairs:", err.message);
    res.status(500).json({ error: "Failed to fetch chairs" });
  }
};
