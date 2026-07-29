import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "swap_request",
        "swap_accepted",
        "swap_rejected",
        "swap_completed",
        "message",
        "review",
        "session_scheduled",
        "session_reminder",
        "badge_earned",
        "system",
      ],
      required: true,
    },
    text: { type: String, required: true },
    link: { type: String, default: "" },
    isRead: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
