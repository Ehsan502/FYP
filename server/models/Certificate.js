import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    swapRequest: { type: mongoose.Schema.Types.ObjectId, ref: "SwapRequest", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skillTitle: { type: String, required: true },
    partnerName: { type: String, required: true },
    certificateNumber: { type: String, required: true, unique: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Certificate", certificateSchema);
