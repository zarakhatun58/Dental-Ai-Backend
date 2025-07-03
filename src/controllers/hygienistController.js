import pool from "../config/db.js";

export const getHygienists = async (req, res) => {
    try {
        const [hygienists] = await pool.query(`
      SELECT ProvNum AS id, CONCAT(FName, ' ', LName) AS name
      FROM provider
      WHERE IsHidden = 0
    `);

        res.status(200).json(
            hygienists.map(hygienist => ({
                id: hygienist.id,
                label: hygienist.name
            }))
        );
    } catch (err) {
        console.error("Error fetching hygienists:", err.message);
        res.status(500).json({ error: "Failed to fetch hygienists" });
    }
};
