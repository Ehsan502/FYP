import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["user", "skill"], required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    targetSkill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
    reason: { type: String, required: true, maxlength: 500 },
    status: { type: String, enum: ["pending", "reviewed", "resolved", "dismissed"], default: "pending" },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
