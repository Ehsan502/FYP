import express from "express";
import { getUserRecommendations, getSkillRecommendations, getLearningRoadmap } from "../controllers/recommendationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", protect, getUserRecommendations);
router.get("/skills", protect, getSkillRecommendations);
router.get("/roadmap", protect, getLearningRoadmap);

export default router;
