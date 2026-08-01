import express from "express";
import {
  getAllUsersForChat,
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  blockUser,
  deleteConversation,
  getSupportReply,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// FIXED: Is line ko sab se ooper include karein
router.get("/users", protect, getAllUsersForChat);

router.get("/conversations", protect, getMyConversations);
router.post("/conversations", protect, getOrCreateConversation);
router.get("/messages/:conversationId", protect, getMessages);
router.post("/messages", protect, upload.single("file"), sendMessage);
router.post("/block", protect, blockUser);
router.delete("/conversations/:conversationId", protect, deleteConversation);
router.post("/support", getSupportReply);

export default router;