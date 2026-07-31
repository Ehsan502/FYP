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
      console.error("CRITICAL: GEMINI_API_KEY is missing in environment variables!");
      throw new Error("GEMINI_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });

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

    throw new Error("EMPTY_GEMINI_RESPONSE");
  } catch (error) {
    console.error("--- GEMINI API ERROR LOG ---", error.message || error);

    // Smart Fallback Engine (No repetitive dumb replies!)
    const q = (req.body.query || "").toLowerCase().trim();

    if (q.includes("req") || q.includes("request") || q.includes("send") || q.includes("byjon") || q.includes("bhej")) {
      return res.json({ reply: "Swap Request bhejne ke liye 'Explore' page par ja kar skill select karein aur 'Request' button click karein." });
    }
    if (q.includes("media") || q.includes("upload") || q.includes("file") || q.includes("photo") || q.includes("image")) {
      return res.json({ reply: "Chat mein media upload karne ke liye message bar ke saath bane attachment/clip icon par click karein." });
    }
    if (q.includes("swap") || q.includes("trade") || q.includes("skill")) {
      return res.json({ reply: "SkillSwap par bina paise diye skills seekh sakte hain! Top bar se '+ Post a Skill' karke apni skill add karein." });
    }
    if (q.includes("chat") || q.includes("message") || q.includes("baat")) {
      return res.json({ reply: "Request accept hone ke baad 'Chat' section unlock ho jata hai jahan aap direct message kar sakte hain." });
    }
    if (q.includes("schedule") || q.includes("availability") || q.includes("time")) {
      return res.json({ reply: "Schedule page par ja kar apne swap session ki timing set karein." });
    }
    if (q.includes("certificate") || q.includes("cert")) {
      return res.json({ reply: "Session complete hone par Certificates section se apna completion certificate generate kar sakte hain." });
    }
    if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("salam")) {
      return res.json({ reply: "Hello! Main SkillSwap Support Bot hoon. Main aapki kya madad kar sakta hoon?" });
    }

    // Default Fallback
    return res.json({
      reply: "Main SkillSwap Assistant hoon. Aap Explore, Chat, Schedule ya Certificates ke baare mein specifically pooch sakte hain!"
    });
  }
});

export default router;