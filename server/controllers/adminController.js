import User from "../models/User.js";
import Skill from "../models/Skill.js";
import SwapRequest from "../models/SwapRequest.js";
import Report from "../models/Report.js";
import Review from "../models/Review.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = search
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
      : {};
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users.map((u) => u.toSafeObject()));
  } catch (error) {
    next(error);
  }
};

export const toggleBlockUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ message: "Cannot block an admin" });

    user.isBlocked = !user.isBlocked;
    user.blockReason = user.isBlocked ? reason || "Violation of community guidelines" : "";
    await user.save();

    res.json(user.toSafeObject());
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ message: "Cannot delete an admin" });

    await Skill.deleteMany({ user: user._id });
    await user.deleteOne();
    res.json({ message: "User removed" });
  } catch (error) {
    next(error);
  }
};

export const getAllSkillsAdmin = async (req, res, next) => {
  try {
    const skills = await Skill.find().populate("user", "name email isBlocked").sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
    next(error);
  }
};

export const deleteSkillAdmin = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    await skill.deleteOne();
    res.json({ message: "Skill removed by admin" });
  } catch (error) {
    next(error);
  }
};

export const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate("reportedBy", "name email")
      .populate("targetUser", "name email isBlocked")
      .populate("targetSkill", "title")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    );
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalSkills, totalSwaps, completedSwaps, pendingReports, blockedUsers, totalReviews] =
      await Promise.all([
        User.countDocuments(),
        Skill.countDocuments(),
        SwapRequest.countDocuments(),
        SwapRequest.countDocuments({ status: "completed" }),
        Report.countDocuments({ status: "pending" }),
        User.countDocuments({ isBlocked: true }),
        Review.countDocuments(),
      ]);

    const categoryBreakdown = await Skill.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const swapStatusBreakdown = await SwapRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    res.json({
      totalUsers,
      totalSkills,
      totalSwaps,
      completedSwaps,
      pendingReports,
      blockedUsers,
      totalReviews,
      categoryBreakdown,
      swapStatusBreakdown,
      usersByMonth,
    });
  } catch (error) {
    next(error);
  }
};
