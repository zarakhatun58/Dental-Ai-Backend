import express from "express";
import {
  registerUser,
  loginUser,
  // getProfile,
  // logout,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// router.get('/profile', authMiddleware, getProfile);
// router.post("/logout", logout);

export default router;
