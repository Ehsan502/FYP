import SwapRequest from "../models/SwapRequest.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";
import { createNotification } from "../utils/notify.js";
import { awardPoints } from "../utils/gamification.js";

// 1. Create / Send Swap Request
export const createSwapRequest = async (req, res, next) => {
  try {
    const { skillId, skillOffered, message } = req.body;

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Convert ObjectId to string for strict comparison
    const skillOwnerId = skill.user._id ? skill.user._id.toString() : skill.user.toString();

    if (skillOwnerId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot request your own skill" });
    }

    const swap = await SwapRequest.create({
      requester: req.user._id,
      receiver: skillOwnerId,
      skillRequested: skill._id,
      skillOffered: skillOffered || "General Skill Swap",
      message: message || "",
    });

    const populated = await swap.populate([
      { path: "requester", select: "name avatar" },
      { path: "receiver", select: "name avatar" },
      { path: "skillRequested", select: "title category" },
    ]);

    // Send Notification safely
    try {
      await createNotification({
        user: skillOwnerId,
        sender: req.user._id,
        type: "swap_request",
        text: `${req.user.name} wants to swap for "${skill.title}"`,
        link: "/requests",
        relatedId: swap._id,
      });
    } catch (notifErr) {
      console.error("Notification creation error (ignored):", notifErr);
    }

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating swap request:", error);
    next(error);
  }
};

export const sendSwapRequest = createSwapRequest;

// 2. Fetch User Swaps
export const getMySwaps = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch incoming and outgoing requests matching current logged in user
    const incoming = await SwapRequest.find({ receiver: userId })
      .populate("requester", "name email avatar")
      .populate("receiver", "name email avatar")
      .populate("skillRequested", "title")
      .sort({ createdAt: -1 });

    const outgoing = await SwapRequest.find({ requester: userId })
      .populate("requester", "name email avatar")
      .populate("receiver", "name email avatar")
      .populate("skillRequested", "title")
      .sort({ createdAt: -1 });

    res.json({ 
      incoming: incoming || [], 
      outgoing: outgoing || [] 
    });
  } catch (error) {
    console.error("Error fetching swaps:", error);
    res.status(500).json({ message: "Server error fetching swaps" });
  }
};

export const getUserSwaps = getMySwaps;

// 3. Update Swap Status (Accept / Reject / Complete / Cancel)
export const updateSwapStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["accepted", "rejected", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const swap = await SwapRequest.findById(req.params.id).populate("skillRequested", "title");
    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    const isReceiver = swap.receiver.toString() === req.user._id.toString();
    const isRequester = swap.requester.toString() === req.user._id.toString();

    if (!isReceiver && !isRequester) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if ((status === "accepted" || status === "rejected") && !isReceiver) {
      return res.status(403).json({ message: "Only the receiver can accept or reject" });
    }

    swap.status = status;
    await swap.save();

    const otherPartyId = isReceiver ? swap.requester : swap.receiver;

    if (status === "accepted") {
      await createNotification({
        user: swap.requester,
        sender: req.user._id,
        type: "swap_accepted",
        text: `Your swap request for "${swap.skillRequested?.title || 'Skill'}" was accepted`,
        link: "/requests",
        relatedId: swap._id,
      });
    }

    if (status === "rejected") {
      await createNotification({
        user: swap.requester,
        sender: req.user._id,
        type: "swap_rejected",
        text: `Your swap request for "${swap.skillRequested?.title || 'Skill'}" was declined`,
        link: "/requests",
        relatedId: swap._id,
      });
    }

    if (status === "completed") {
      await User.findByIdAndUpdate(swap.requester, { $inc: { completedSwaps: 1 } });
      await User.findByIdAndUpdate(swap.receiver, { $inc: { completedSwaps: 1 } });
      await awardPoints(swap.requester, 25, "Completed a swap");
      await awardPoints(swap.receiver, 25, "Completed a swap");

      await createNotification({
        user: otherPartyId,
        sender: req.user._id,
        type: "swap_completed",
        text: `Swap for "${swap.skillRequested?.title || 'Skill'}" marked as completed. Leave a review!`,
        link: "/requests",
        relatedId: swap._id,
      });
    }

    res.json(swap);
  } catch (error) {
    next(error);
  }
};