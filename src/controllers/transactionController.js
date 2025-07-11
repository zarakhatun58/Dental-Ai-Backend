import pool from "../config/db.js";
import { sendAndStoreNotification } from "../utils/sendNotification.js";


// Create a new transaction
export const createTransaction = async (req, res) => {
  try {
    const userId = req.userId || "admin";
    const { patient, service, amount, method, status } = req.body;

    if (!patient || !service || !amount || !method || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO transactions (patient, service, amount, method, status)
       VALUES (?, ?, ?, ?, ?)`,
      [patient, service, amount, method, status]
    );

    res.status(201).json({
      message: 'Transaction created successfully',
      transactionId: result.insertId,
    });
    await sendAndStoreNotification({
      userId: req.userId,
      title: "Payment Received",
      type: "transactions",
      context: `A new payment of ${amount} was received from ${payerName}.`
    });

  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM transactions ORDER BY created_at DESC`);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};