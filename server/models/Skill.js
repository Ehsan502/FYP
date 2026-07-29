import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 500 },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert"], default: "Intermediate" },
    tags: [{ type: String, trim: true }],
    availability: { type: String, default: "Flexible" },
  },
  { timestamps: true }
);

skillSchema.index({ title: "text", description: "text", tags: "text", category: "text" });

export default mongoose.model("Skill", skillSchema);
