import User from "../models/User.js";
import Skill from "../models/Skill.js";
import { getRoadmap } from "../utils/roadmaps.js";

const overlapScore = (a = [], b = []) => {
  const setB = new Set(b.map((x) => x.toLowerCase().trim()));
  return a.filter((x) => setB.has(x.toLowerCase().trim())).length;
};

export const getUserRecommendations = async (req, res, next) => {
  try {
    const me = await User.findById(req.user._id);
    const candidates = await User.find({
      _id: { $ne: me._id },
      isBlocked: false,
    }).limit(200);

    const scored = candidates
      .map((u) => {
        const theyTeachWhatIWant = overlapScore(me.skillsWanted, u.skillsOffered);
        const iTeachWhatTheyWant = overlapScore(u.skillsWanted, me.skillsOffered);
        const score = theyTeachWhatIWant * 2 + iTeachWhatTheyWant * 2 + (u.rating || 0);
        return { user: u.toSafeObject(), score, mutualMatch: theyTeachWhatIWant > 0 && iTeachWhatTheyWant > 0 };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    res.json(scored);
  } catch (error) {
    next(error);
  }
};

export const getSkillRecommendations = async (req, res, next) => {
  try {
    const me = await User.findById(req.user._id);

    let matchingSkills = [];
    if (me.skillsWanted?.length > 0) {
      matchingSkills = await Skill.find({
        user: { $ne: me._id },
        $or: me.skillsWanted.map((s) => ({ title: { $regex: s, $options: "i" } })),
      })
        .populate("user", "name avatar rating location")
        .limit(8);
    }

    const categoryCounts = await Skill.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      matchingSkills,
      trendingCategories: categoryCounts.map((c) => ({ category: c._id, count: c.count })),
    });
  } catch (error) {
    next(error);
  }
};

export const getLearningRoadmap = async (req, res, next) => {
  try {
    const { category } = req.query;
    const roadmap = getRoadmap(category || "Other");
    res.json({ category: category || "Other", steps: roadmap });
  } catch (error) {
    next(error);
  }
};
