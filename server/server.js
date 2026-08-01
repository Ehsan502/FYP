import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import dns from "dns";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

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

dotenv.config();

// DNS Override
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (e) {
  console.log("DNS set error ignored");
}

const app = express();

// Allowed Origins
const allowedOrigins = [
  "https://fypapp.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

if (process.env.CLIENT_URL) {
  const cleanEnvUrl = process.env.CLIENT_URL.replace(/\[.*\]\(|\)/g, "").trim();
  if (cleanEnvUrl && !allowedOrigins.includes(cleanEnvUrl)) {
    allowedOrigins.push(cleanEnvUrl);
  }
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Database Connection Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB Connection Failure:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("SkillSwap Backend Ready and Connected!");
});

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

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`SkillSwap server running on port ${PORT}`);
  });
}

export default app;