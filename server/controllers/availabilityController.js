import Availability from "../models/Availability.js";

export const getMyAvailability = async (req, res, next) => {
  try {
    let availability = await Availability.findOne({ user: req.user._id });
    if (!availability) {
      availability = await Availability.create({ user: req.user._id, slots: [] });
    }
    res.json(availability);
  } catch (error) {
    next(error);
  }
};

export const getUserAvailability = async (req, res, next) => {
  try {
    const availability = await Availability.findOne({ user: req.params.userId });
    res.json(availability || { slots: [] });
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const { slots, timezone } = req.body;
    const availability = await Availability.findOneAndUpdate(
      { user: req.user._id },
      { slots, timezone },
      { new: true, upsert: true }
    );
    res.json(availability);
  } catch (error) {
    next(error);
  }
};
