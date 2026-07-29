import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "", maxlength: 2000 },
    fileUrl: { type: String, default: "" },
    fileType: { type: String, default: "" },
    fileName: { type: String, default: "" },
    seen: { type: Boolean, default: false },
    seenAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
