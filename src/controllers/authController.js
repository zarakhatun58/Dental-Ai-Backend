import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { sendNotification } from "../utils/sendNotification.js";

// 🚀 Register
// ✅ No bcrypt used
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required." });
    }

    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    const userId = result.insertId.toString();

    // ✅ Send success response first so frontend can store user + connect socket
    res.status(201).json({
      message: "Registration successful",
      userId,
      user: {
        id: userId,
        name,
        email,
      },
    });

    // ⏳ Delay notification to allow frontend time to connect socket
   setTimeout(async () => {
  await sendNotification({
    userId,
    title: "User Registered",
    message: `${name} signed up`,
    type: "system",
  });

  await sendNotification({
    userId,
    title: "Welcome to SmilePro!",
    type: "account",
    context: `New user registered: ${email}`,
  });

  console.log(`📢 Notifications emitted to user ${userId} after registration`);
}, 2000); 
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const userId = user.id.toString();

    // ✅ Send response first so frontend can store & connect socket
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    // ⏳ Delay notification until socket joins
    setTimeout(() => {
      sendNotification({
        userId,
        title: "Login Successful",
        message: `User ${user.name} logged in.`,
        type: "login",
      });
    }, 1000); // 1 second delay
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};







// 👤 Get Profile
export const getProfile = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [decoded.id]
    );

    const user = users[0];

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Profile error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

// 🚪 Logout
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.json({ message: "Logged out successfully" });
};
