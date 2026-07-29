import Skill from "../models/Skill.js";

export const createSkill = async (req, res, next) => {
  try {
    const { title, category, description, level, tags, availability } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const skill = await Skill.create({
      user: req.user._id,
      title,
      category,
      description,
      level,
      availability,
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : [],
    });

    const populated = await skill.populate("user", "name avatar rating location");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getSkills = async (req, res, next) => {
  try {
    const { search, category, excludeMine } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category && category !== "All") {
      query.category = category;
    }
    if (excludeMine === "true" && req.user) {
      query.user = { $ne: req.user._id };
    }

    const skills = await Skill.find(query)
      .populate("user", "name avatar rating ratingCount location")
      .sort({ createdAt: -1 });

    res.json(skills);
  } catch (error) {
    next(error);
  }
};

export const getMySkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
    next(error);
  }
};

export const getSkillById = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id).populate("user", "name avatar rating ratingCount location bio");
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    res.json(skill);
  } catch (error) {
    next(error);
  }
};

export const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    if (skill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this skill" });
    }

    const fields = ["title", "category", "description", "level", "availability"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) skill[f] = req.body[f];
    });
    if (req.body.tags) {
      skill.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(",").map((t) => t.trim());
    }

    const updated = await skill.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    if (skill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this skill" });
    }
    await skill.deleteOne();
    res.json({ message: "Skill removed" });
  } catch (error) {
    next(error);
  }
};
