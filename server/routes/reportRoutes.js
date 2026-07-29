import express from "express";
import { createReport, getMyReports } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReport);
router.get("/mine", protect, getMyReports);

export default router;
