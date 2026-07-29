import express from "express";
import { getLeaderboard, getMyRank } from "../controllers/leaderboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get global swappers leaderboard
router.get("/", protect, getLeaderboard);

// Get current logged-in user rank and stats
router.get("/my-rank", protect, getMyRank);

export default router;