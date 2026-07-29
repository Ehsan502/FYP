import express from "express";
import { uploadAvatar } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

export default router;
