import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getDashboardStats,
  getLeaderboard,
  deleteUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js"; // Imported User model for 2FA toggle

const router = express.Router();

router.get("/leaderboard", getLeaderboard);
router.get("/dashboard", protect, getDashboardStats);
router.get("/profile/:id", getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.delete("/profile", protect, deleteUserProfile);

// FIXED: 2FA Toggle Route Add kar diya hai
router.put("/toggle-2fa", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.twoFactorEnabled = req.body.enabled;
    await user.save();

    res.json({
      message: `2FA ${user.twoFactorEnabled ? "enabled" : "disabled"} successfully`,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (error) {
    next(error);
  }
});

export default router;