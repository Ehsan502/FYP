import express from "express";
import { GoogleGenAI } from "@google/genai";
import { protect } from "../middleware/authMiddleware.js";
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  blockUser,
  deleteConversation,
} from "../controllers/chatController.js";

const router = express.Router();

// Chat & Conversation Routes
router.post("/conversation", protect, getOrCreateConversation);
router.get("/conversations", protect, getMyConversations);
router.get("/messages/:conversationId", protect, getMessages);
router.post("/message", protect, sendMessage);

// Safety & Moderation Routes
router.post("/block", protect, blockUser);
router.delete("/conversation/:conversationId", protect, deleteConversation);

// Multilingual SkillSwap AI Support Bot Route
router.post("/support", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ reply: "Please ask a question." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: GEMINI_API_KEY is missing in server/.env file!");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey || "" });

    const SKILLSWAP_CONTEXT = `
You are the AI Support Assistant for the SkillSwap platform.
Answer the user's questions in whatever language they ask (English, Roman Urdu, Urdu script, Hindi, etc.). Always match the user's language and tone!

Project Details:
- SkillSwap is a 1-on-1 peer skill exchange platform (free, no subscriptions).
- Explore page is for searching skills & requesting swaps.
- Chat has media/file attachments, block user, and delete conversation.
- Schedule page is for setting weekly/weekend availability & swap sessions.
- Certificates are unlocked after completing scheduled sessions.
- Leaderboard tracks karma/points.
- Admin panel manages users & platform moderation.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${SKILLSWAP_CONTEXT}\n\nUser Question: ${query}` }],
        },
      ],
    });

    const reply = response.text;
    if (reply) {
      return res.json({ reply });
    }

    res.json({ reply: "Aapka sawal samajh nahi aaya, dobara poochein." });
  } catch (error) {
    console.error("--- GEMINI API ERROR LOG ---", error);

    // Dynamic keyword response if AI API fails
    const q = (req.body.query || "").toLowerCase();
    if (q.includes("media") || q.includes("upload") || q.includes("file") || q.includes("photo")) {
      return res.json({ reply: "Chat mein media upload karne ke liye input box ke sath paperclip/image icon par click karein." });
    }
    if (q.includes("swap") || q.includes("request")) {
      return res.json({ reply: "Explore page par ja kar skill select karein aur 'Request Swap' dabayein." });
    }
    if (q.includes("schedule") || q.includes("availability")) {
      return res.json({ reply: "Schedule page par ja kar weekly ya weekend slots set karein." });
    }

    res.json({
      reply: `Mujhe aapke sawal "${req.body.query}" ka jawab mil gaya hai! Main SkillSwap Assistant hoon, aap Explore, Chat, Schedule, ya Certificates ke baare mein kuch bhi pooch sakte hain.`
    });
  }
});

export default router;