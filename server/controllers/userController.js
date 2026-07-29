import User from "../models/User.js";
import { getLevelForPoints } from "../utils/gamification.js";

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ ...user.toSafeObject(), level: getLevelForPoints(user.points) });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name ?? user.name;
    user.bio = req.body.bio ?? user.bio;
    user.location = req.body.location ?? user.location;
    user.avatar = req.body.avatar ?? user.avatar;
    user.experienceLevel = req.body.experienceLevel ?? user.experienceLevel;
    user.education = req.body.education ?? user.education;
    user.linkedin = req.body.linkedin ?? user.linkedin;
    user.github = req.body.github ?? user.github;

    if (Array.isArray(req.body.skillsOffered)) user.skillsOffered = req.body.skillsOffered;
    if (Array.isArray(req.body.skillsWanted)) user.skillsWanted = req.body.skillsWanted;
    if (Array.isArray(req.body.portfolioLinks)) user.portfolioLinks = req.body.portfolioLinks;
    if (Array.isArray(req.body.languages)) user.languages = req.body.languages;

    user._skillCount = user.skillsOffered?.length || 0;
    user.recalculateBadges();

    const updated = await user.save();
    res.json({ ...updated.toSafeObject(), level: getLevelForPoints(updated.points) });
  } catch (error) {
    next(error);
  }
};
export const getDashboardStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      totalSkillsOffered: user.skillsOffered?.length || 0,
      totalSkillsWanted: user.skillsWanted?.length || 0,
      completedSwaps: user.completedSwaps || 0,
      rating: user.rating || 0,
      ratingCount: user.ratingCount || 0,
      points: user.points || 0,
      badges: user.badges || [],
      level: getLevelForPoints ? getLevelForPoints(user.points || 0) : { name: "Beginner" },
      profileCompletion: user.getProfileCompletion ? user.getProfileCompletion() : 50,
    });
  } catch (error) {
    next(error);
  }
};
export const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ isBlocked: false })
      .sort({ points: -1 })
      .limit(50)
      .select("name avatar points badges completedSwaps rating");

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      _id: u._id,
      name: u.name,
      avatar: u.avatar,
      points: u.points,
      badges: u.badges,
      completedSwaps: u.completedSwaps,
      rating: u.rating,
      level: getLevelForPoints(u.points),
    }));

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      await User.findByIdAndDelete(req.user._id);
      res.json({ success: true, message: "User account deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    next(error);
  }
};