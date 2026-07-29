import express from "express";
import {
  getMyCertificates,
  getEligibleSwaps,
  issueCertificate,
  downloadCertificate,
} from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, getMyCertificates);
router.get("/eligible", protect, getEligibleSwaps);
router.post("/", protect, issueCertificate);
router.get("/:id/download", protect, downloadCertificate);

export default router;
