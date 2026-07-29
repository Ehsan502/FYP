import express from "express";
import {
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  getAllSkillsAdmin,
  deleteSkillAdmin,
  getAllReports,
  updateReportStatus,
  getAnalytics,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/users", getAllUsers);
router.put("/users/:id/block", toggleBlockUser);
router.delete("/users/:id", deleteUser);

router.get("/skills", getAllSkillsAdmin);
router.delete("/skills/:id", deleteSkillAdmin);

router.get("/reports", getAllReports);
router.put("/reports/:id", updateReportStatus);

router.get("/analytics", getAnalytics);

export default router;
