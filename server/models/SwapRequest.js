import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skillRequested: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
    skillOffered: { type: String, required: true },
    message: { type: String, default: "", maxlength: 400 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    reviewedByRequester: { type: Boolean, default: false },
    reviewedByReceiver: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("SwapRequest", swapRequestSchema);
