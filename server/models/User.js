import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const BADGE_DEFINITIONS = [
  { key: "first_swap", label: "First Swap", description: "Completed your first skill swap", minSwaps: 1 },
  { key: "swap_regular", label: "Swap Regular", description: "Completed 5 skill swaps", minSwaps: 5 },
  { key: "swap_veteran", label: "Swap Veteran", description: "Completed 15 skill swaps", minSwaps: 15 },
  { key: "swap_legend", label: "Swap Legend", description: "Completed 30 skill swaps", minSwaps: 30 },
  { key: "top_rated", label: "Top Rated", description: "Maintained a 4.5+ rating with 5+ reviews", minRating: 4.5, minReviews: 5 },
  { key: "helpful_teacher", label: "Helpful Teacher", description: "Posted 5 or more skills", minSkills: 5 },
];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    bio: { type: String, default: "", maxlength: 300 },
    avatar: { type: String, default: "" },
    avatarPublicId: { type: String, default: "" },
    location: { type: String, default: "" },

    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String, default: "" },

    // Harassment Block List (Blocked User IDs)
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    skillsOffered: [{ type: String, trim: true }],
    skillsWanted: [{ type: String, trim: true }],

    experienceLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert", ""], default: "" },
    education: { type: String, default: "", maxlength: 200 },
    portfolioLinks: [{ type: String, trim: true }],
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    languages: [{ type: String, trim: true }],

    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    trustScore: { type: Number, default: 0 },
    completedSwaps: { type: Number, default: 0 },

    points: { type: Number, default: 0 },
    badges: [{ type: String }],

    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    socketId: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getProfileCompletion = function () {
  const fields = [
    this.bio,
    this.avatar,
    this.location,
    this.experienceLevel,
    this.education,
    this.linkedin || this.github,
    this.languages?.length > 0,
    this.skillsOffered?.length > 0,
    this.skillsWanted?.length > 0,
    this.portfolioLinks?.length > 0,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};

userSchema.methods.recalculateBadges = function () {
  const earned = [];
  for (const def of BADGE_DEFINITIONS) {
    if (def.minSwaps && this.completedSwaps >= def.minSwaps) earned.push(def.key);
    if (def.minRating && this.rating >= def.minRating && this.ratingCount >= def.minReviews) earned.push(def.key);
    if (def.minSkills && this._skillCount >= def.minSkills) earned.push(def.key);
  }
  this.badges = earned;
  return earned;
};

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    bio: this.bio,
    avatar: this.avatar,
    location: this.location,
    role: this.role,
    isBlocked: this.isBlocked,
    blockedUsers: this.blockedUsers,
    skillsOffered: this.skillsOffered,
    skillsWanted: this.skillsWanted,
    experienceLevel: this.experienceLevel,
    education: this.education,
    portfolioLinks: this.portfolioLinks,
    linkedin: this.linkedin,
    github: this.github,
    languages: this.languages,
    rating: this.rating,
    ratingCount: this.ratingCount,
    trustScore: this.trustScore,
    completedSwaps: this.completedSwaps,
    points: this.points,
    badges: this.badges,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen,
    profileCompletion: this.getProfileCompletion(),
    createdAt: this.createdAt,
  };
};

export const BADGES = BADGE_DEFINITIONS;

export default mongoose.model("User", userSchema);