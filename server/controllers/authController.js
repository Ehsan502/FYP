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
    const { email, password, captchaAnswer, expectedAnswer } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked. Contact support." });
    }

    // Step 1: Challenge return karein agar captcha answer nahi mila
    if (captchaAnswer === undefined || captchaAnswer === null || captchaAnswer === "") {
      const num1 = Math.floor(Math.random() * 9) + 1;
      const num2 = Math.floor(Math.random() * 9) + 1;

      return res.status(200).json({
        requires2FA: true,
        question: `What is ${num1} + ${num2}?`,
        expectedAnswer: num1 + num2,
        message: "Complete the security challenge to login",
      });
    }

    // Step 2: Answer Verification
    if (parseInt(captchaAnswer, 10) !== parseInt(expectedAnswer, 10)) {
      return res.status(400).json({ message: "Incorrect 2FA Security Challenge answer!" });
    }

    // Step 3: Success Login
    res.json({
      user: { ...user.toSafeObject(), level: getLevelForPoints(user.points) },
      token: generateToken(user._id),
    });
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

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const clientUrl = process.env.CLIENT_URL || "https://fypapp.netlify.app";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    res.status(200).json({
      success: true,
      message: "Reset link generated successfully",
      resetUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
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

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};