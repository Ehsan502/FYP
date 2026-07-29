import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getDashboardStats,
  getLeaderboard,
  deleteUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/leaderboard", getLeaderboard);
router.get("/dashboard", protect, getDashboardStats);
router.get("/profile/:id", getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.delete("/profile", protect, deleteUserProfile);

export default router;