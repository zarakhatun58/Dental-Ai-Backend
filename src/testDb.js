import pool from "./config/db.js";


(async () => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    console.log("✅ Connected. Time:", rows[0].now);
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
  }
})();
