import Report from "../models/Report.js";

export const createReport = async (req, res, next) => {
  try {
    const { targetType, targetUserId, targetSkillId, reason } = req.body;

    if (!targetType || !reason) {
      return res.status(400).json({ message: "targetType and reason are required" });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      targetType,
      targetUser: targetType === "user" ? targetUserId : undefined,
      targetSkill: targetType === "skill" ? targetSkillId : undefined,
      reason,
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

export const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    next(error);
  }
};
