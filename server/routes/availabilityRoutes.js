import express from "express";
import { getMyAvailability, getUserAvailability, updateAvailability } from "../controllers/availabilityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, getMyAvailability);
router.put("/mine", protect, updateAvailability);
router.get("/:userId", getUserAvailability);

export default router;
