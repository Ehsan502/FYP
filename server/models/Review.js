import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    swapRequest: { type: mongoose.Schema.Types.ObjectId, ref: "SwapRequest", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

reviewSchema.index({ swapRequest: 1, reviewer: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
