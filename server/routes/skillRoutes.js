import express from "express";
import {
  createSkill,
  getSkills,
  getMySkills,
  getSkillById,
  updateSkill,
  deleteSkill,
} from "../controllers/skillController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getSkills).post(protect, createSkill);
router.get("/mine", protect, getMySkills);
router.route("/:id").get(getSkillById).put(protect, updateSkill).delete(protect, deleteSkill);

export default router;
