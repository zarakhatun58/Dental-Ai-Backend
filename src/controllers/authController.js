import bcrypt from 'bcrypt';
import pool from "../config/db.js";
import { sendAndStoreNotification } from "../utils/sendNotification.js";
import jwt from "jsonwebtoken";

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      [name, email, hashedPassword]
    );

    const userId = result.insertId;

    await sendAndStoreNotification({
      userId,
      title: "Welcome to SmilePro! 🎉",
      message: "Your account has been created successfully.",
      type: "account",
    });

    // ✅ FIXED: Return as { user, token }
    res.status(201).json({
      user: { id: userId, name, email },
      token: createToken(userId),
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await sendAndStoreNotification({
      userId: user.id,
      title: "Login Successful ✅",
      message: "You just logged into your account.",
      type: "login",
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: createToken(user.id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};