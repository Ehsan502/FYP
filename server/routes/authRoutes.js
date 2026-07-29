import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

// Password Reset routes
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

export default router;