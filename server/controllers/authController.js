import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { getLevelForPoints } from "../utils/gamification.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, skillsOffered, skillsWanted } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const user = await User.create({
      name,
      email,
      password,
      skillsOffered: skillsOffered || [],
      skillsWanted: skillsWanted || [],
    });

    res.status(201).json({
      user: { ...user.toSafeObject(), level: getLevelForPoints(user.points) },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.isBlocked) {
        return res.status(403).json({ message: "Your account has been blocked. Contact support." });
      }
      res.json({
        user: { ...user.toSafeObject(), level: getLevelForPoints(user.points) },
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ ...user.toSafeObject(), level: getLevelForPoints(user.points) });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Generate Token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire time (10 mins)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Frontend URL jahan token bheja jayega
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    res.status(200).json({
      success: true,
      message: "Reset link generated successfully",
      resetUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};