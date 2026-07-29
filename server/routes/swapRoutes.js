import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createSwapRequest,
  getMySwaps,
  updateSwapStatus,
} from "../controllers/swapController.js";

const router = express.Router();

router.post("/", protect, createSwapRequest);
router.post("/send", protect, createSwapRequest);
router.get("/mine", protect, getMySwaps);
router.put("/:id", protect, updateSwapStatus);

export default router;