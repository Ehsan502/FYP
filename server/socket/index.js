import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

let io;
const onlineUsers = new Map(); // userId -> socketId
const typingUsers = new Map(); // conversationId -> Set(userId)

export const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: { origin: clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    socket.join(userId);

    await User.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id, lastSeen: new Date() });
    io.emit("presence:update", { userId, isOnline: true });

    socket.on("chat:join", (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("chat:typing", ({ conversationId, isTyping }) => {
      if (!typingUsers.has(conversationId)) typingUsers.set(conversationId, new Set());
      const set = typingUsers.get(conversationId);
      if (isTyping) set.add(userId);
      else set.delete(userId);
      socket.to(`conv:${conversationId}`).emit("chat:typing", { conversationId, userId, isTyping });
    });

    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, socketId: "", lastSeen: new Date() });
      io.emit("presence:update", { userId, isOnline: false, lastSeen: new Date() });
    });
  });

  return io;
};

export const getIO = () => io;

export const isUserOnline = (userId) => onlineUsers.has(userId.toString());

export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(userId.toString()).emit(event, payload);
};
