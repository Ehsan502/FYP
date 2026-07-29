import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    swapRequest: { type: mongoose.Schema.Types.ObjectId, ref: "SwapRequest", required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    mode: { type: String, enum: ["online", "in-person"], default: "online" },
    location: { type: String, default: "" },
    notes: { type: String, default: "", maxlength: 400 },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
