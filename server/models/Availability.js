import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    day: { type: String, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    slots: [slotSchema],
    timezone: { type: String, default: "UTC" },
  },
  { timestamps: true }
);

export default mongoose.model("Availability", availabilitySchema);
