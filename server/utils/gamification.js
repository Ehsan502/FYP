import User from "../models/User.js";
import { createNotification } from "./notify.js";

export const awardPoints = async (userId, amount, reason = "") => {
  const user = await User.findById(userId);
  if (!user) return;

  const previousBadges = new Set(user.badges);
  user.points += amount;
  user._skillCount = user.skillsOffered?.length || 0;
  const newBadges = user.recalculateBadges();
  await user.save();

  const earnedNow = newBadges.filter((b) => !previousBadges.has(b));
  for (const badgeKey of earnedNow) {
    await createNotification({
      user: userId,
      type: "badge_earned",
      text: `You earned a new badge: ${badgeKey.replace(/_/g, " ")}!`,
      link: "/profile",
    });
  }

  return user;
};

export const LEVELS = [
  { name: "Novice", minPoints: 0 },
  { name: "Contributor", minPoints: 50 },
  { name: "Skilled Swapper", minPoints: 150 },
  { name: "Expert Swapper", minPoints: 300 },
  { name: "Community Champion", minPoints: 600 },
];

export const getLevelForPoints = (points) => {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (points >= level.minPoints) current = level;
  }
  return current;
};
