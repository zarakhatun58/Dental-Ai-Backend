import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { sendNotification } from "../utils/sendNotification.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [newUser._id.toString(), 'User Registered', `${name} signed up`, 'system']
    );

    res.status(201).json({ message: "Registration successful" });
      // Trigger system & Gemini-generated welcome notifications
    await sendNotification({
      user_id: newUser._id.toString(),
      title: "User Registered",
      message: `${name} signed up`,
      type: "system"
    });

    await sendNotification({
      user_id: newUser._id.toString(),
      title: "Welcome to SmilePro!",
      type: "account",
      context: `New user registered with email: ${newUser.email}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
    // Notify login event via Gemini
    await sendNotification({
      user_id: user._id.toString(),
      title: "Login Successful",
      type: "login",
      context: `User logged in from IP ${req.ip} at ${new Date().toLocaleString()}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProfile = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Use the ID from the decoded token to fetch user data
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const logout = (req, res) => {
  res.json({ message: "Logged out" });
};
