import pool from '../config/db.js';

export const getSlotsByDate = async (date) => {
  const [rows] = await pool.query(`
    SELECT s.*, p.*
    FROM slot s
    LEFT JOIN patient p ON s.patientId = p.patientId
    WHERE s.date = ?
    ORDER BY s.time ASC, s.chair ASC
  `, [date]);
  return rows;
};

export const getPatientBookings = async (patientId, date) => {
  const [rows] = await pool.query(`
    SELECT * FROM slot WHERE patientId = ? AND date = ?
  `, [patientId, date]);
  return rows;
};

export const findSlot = async (date, time, chair) => {
  const [rows] = await pool.query(`
    SELECT * FROM slot WHERE date = ? AND time = ? AND chair = ?
  `, [date, time, chair]);
  return rows[0];
};

export const updateSlotBooking = async (slotId, patientId) => {
  await pool.query(`
    UPDATE slot SET status = 'booked', patientId = ? WHERE id = ?
  `, [patientId, slotId]);
};
