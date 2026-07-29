import express from "express";
import { createSession, getMySessions, updateSessionStatus, deleteSession } from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSession);
router.get("/mine", protect, getMySessions);
router.put("/:id", protect, updateSessionStatus);
router.delete("/:id", protect, deleteSession);

export default router;
