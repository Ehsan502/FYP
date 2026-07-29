import express from "express";
import { calculateCompatibility } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Calculate AI compatibility between logged-in user and target user
router.post("/compatibility", protect, calculateCompatibility);

export default router;