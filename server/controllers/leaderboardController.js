import User from "../models/User.js";
import SwapRequest from "../models/SwapRequest.js";

/**
 * @desc    Get Top Ranked Swappers / Leaderboard
 * @route   GET /api/leaderboard
 * @access  Private
 */
export const getLeaderboard = async (req, res, next) => {
  try {
    // Fetch active users sorted by XP or Rating
    const topUsers = await User.find({ isBlocked: { $ne: true } })
      .select("name email avatar bio points averageRating totalReviews skillsToTeach skillsToLearn createdAt")
      .sort({ points: -1, averageRating: -1 })
      .limit(20)
      .lean();

    // Map leaderboard data with calculated ranks and badges
    const leaderboard = topUsers.map((user, index) => {
      let badge = "Swapper";
      if (index === 0) badge = "🥇 Top Mentor";
      else if (index === 1) badge = "🥈 Fast Learner";
      else if (index === 2) badge = "🥉 Rising Star";
      else if (user.points >= 100) badge = "⭐ Skill Pro";

      return {
        rank: index + 1,
        _id: user._id,
        name: user.name,
        avatar: user.avatar || "",
        bio: user.bio || "Active Skill Swapper",
        points: user.points || 0,
        averageRating: user.averageRating || 0.0,
        totalReviews: user.totalReviews || 0,
        skillsCount: (user.skillsToTeach?.length || 0) + (user.skillsToLearn?.length || 0),
        badge,
      };
    });

    res.json({
      success: true,
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current User Rank & Gamification Stats
 * @route   GET /api/leaderboard/my-rank
 * @access  Private
 */
export const getMyRank = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const allUsers = await User.find({ isBlocked: { $ne: true } })
      .select("_id points averageRating")
      .sort({ points: -1, averageRating: -1 })
      .lean();

    const userIndex = allUsers.findIndex(
      (u) => u._id.toString() === userId.toString()
    );

    const currentUser = await User.findById(userId).select("points averageRating name");

    const completedSwapsCount = await SwapRequest.countDocuments({
      status: "completed",
      $or: [{ requester: userId }, { receiver: userId }],
    });

    res.json({
      success: true,
      rank: userIndex !== -1 ? userIndex + 1 : allUsers.length,
      totalParticipants: allUsers.length,
      points: currentUser?.points || 0,
      completedSwaps: completedSwapsCount,
      averageRating: currentUser?.averageRating || 0.0,
    });
  } catch (error) {
    next(error);
  }
};