import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { emitToUser } from "../socket/index.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    // Check if target user has blocked current user or vice versa
    const currentUser = await User.findById(req.user._id);
    if (currentUser.blockedUsers?.includes(userId)) {
      return res.status(403).json({ message: "You have blocked this user." });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user._id, userId] });
    }

    const populated = await conversation.populate("participants", "name avatar isOnline lastSeen");
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

export const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", "name avatar isOnline lastSeen")
      .sort({ lastMessageAt: -1 });

    const withUnread = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await Message.countDocuments({
          conversation: c._id,
          receiver: req.user._id,
          seen: false,
        });
        return { ...c.toObject(), unreadCount };
      })
    );

    res.json(withUnread);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });

    await Message.updateMany(
      { conversation: conversationId, receiver: req.user._id, seen: false },
      { seen: true, seenAt: new Date() }
    );

    const conversation = await Conversation.findById(conversationId);
    const otherUser = conversation?.participants.find((p) => p.toString() !== req.user._id.toString());
    if (otherUser) {
      emitToUser(otherUser, "chat:seen", { conversationId, seenBy: req.user._id });
    }

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text } = req.body;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    const receiverId = conversation.participants.find((p) => p.toString() !== req.user._id.toString());

    // Check if receiver has blocked sender
    const receiver = await User.findById(receiverId);
    if (receiver?.blockedUsers?.includes(req.user._id)) {
      return res.status(403).json({ message: "You cannot send messages to this user." });
    }

    let fileUrl = "";
    let fileType = "";
    let fileName = "";

    if (req.file) {
      const resourceType = req.file.mimetype.startsWith("image") ? "image" : "raw";
      const result = await uploadBufferToCloudinary(req.file.buffer, "skillswap/chat", resourceType);
      fileUrl = result.secure_url;
      fileType = req.file.mimetype;
      fileName = req.file.originalname;
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiverId,
      text: text || "",
      fileUrl,
      fileType,
      fileName,
    });

    conversation.lastMessage = text || (fileUrl ? "📎 Attachment" : "");
    conversation.lastMessageAt = new Date();
    conversation.lastSender = req.user._id;
    await conversation.save();

    const populated = await message.populate("sender", "name avatar");

    emitToUser(receiverId, "chat:message", populated);
    emitToUser(req.user._id, "chat:message", populated);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// Harassment Protection: Block User Controller
export const blockUser = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ message: "Target user ID is required" });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUsers: targetUserId },
    });

    res.json({ message: "User blocked successfully" });
  } catch (error) {
    next(error);
  }
};

// Chat Delete Controller
export const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Delete all messages in the conversation
    await Message.deleteMany({ conversation: conversationId });

    // Delete the conversation document itself
    await Conversation.findByIdAndDelete(conversationId);

    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    next(error);
  }
};