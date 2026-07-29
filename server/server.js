import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cron from "node-cron";
import dns from "dns";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { initSocket } from "./socket/index.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

import Session from "./models/Session.js";
import { createNotification } from "./utils/notify.js";

dotenv.config();

// DNS Override for MongoDB Atlas SRV lookup issues
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const server = http.createServer(app);

// Connect DB for Vercel / Serverless
connectDB();

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

initSocket(server, clientUrl);

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SkillSwap API running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.use(notFound);
app.use(errorHandler);

// Cron Job for Reminders
cron.schedule("*/5 * * * *", async () => {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 25 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 45 * 60 * 1000);

    const upcoming = await Session.find({
      status: "scheduled",
      reminderSent: false,
      scheduledAt: {
        $gte: windowStart,
        $lte: windowEnd,
      },
    });

    for (const session of upcoming) {
      await createNotification({
        user: session.organizer,
        type: "session_reminder",
        text: `Reminder: "${session.title}" starts soon`,
        link: "/schedule",
        relatedId: session._id,
      });

      await createNotification({
        user: session.participant,
        type: "session_reminder",
        text: `Reminder: "${session.title}" starts soon`,
        link: "/schedule",
        relatedId: session._id,
      });

      session.reminderSent = true;
      await session.save();
    }
  } catch (err) {
    console.error("Reminder cron error:", err.message);
  }
});

const PORT = process.env.PORT || 5000;

// Local Development listen
if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () => {
    console.log(`SkillSwap server running on port ${PORT}`);
  });
}

// VERCEL / SERVERLESS EXPORT (Fixes the crash error)
export default app;