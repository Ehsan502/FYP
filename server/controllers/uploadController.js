import User from "../models/User.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);

    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId, "image");
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, "skillswap/avatars", "image");

    user.avatar = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    res.json(user.toSafeObject());
  } catch (error) {
    next(error);
  }
};
