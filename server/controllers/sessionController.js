import Session from "../models/Session.js";
import SwapRequest from "../models/SwapRequest.js";
import { createNotification } from "../utils/notify.js";

export const createSession = async (req, res, next) => {
  try {
    const { swapRequestId, title, scheduledAt, durationMinutes, mode, location, notes } = req.body;

    const swap = await SwapRequest.findById(swapRequestId);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });
    if (swap.status !== "accepted" && swap.status !== "completed") {
      return res.status(400).json({ message: "Swap must be accepted before scheduling a session" });
    }

    const isRequester = swap.requester.toString() === req.user._id.toString();
    const isReceiver = swap.receiver.toString() === req.user._id.toString();
    if (!isRequester && !isReceiver) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const participantId = isRequester ? swap.receiver : swap.requester;

    const session = await Session.create({
      swapRequest: swap._id,
      organizer: req.user._id,
      participant: participantId,
      title,
      scheduledAt,
      durationMinutes,
      mode,
      location,
      notes,
    });

    await createNotification({
      user: participantId,
      sender: req.user._id,
      type: "session_scheduled",
      text: `${req.user.name} scheduled a session: "${title}"`,
      link: "/schedule",
      relatedId: session._id,
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};
export const getMySessions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      $or: [
        { organizer: userId },
        { participant: userId },
      ],
    })
      .populate("organizer", "name avatar")
      .populate("participant", "name avatar")
      .sort({ scheduledAt: 1 });

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching sessions" });
  }
};

export const updateSessionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const isParty =
      session.organizer.toString() === req.user._id.toString() ||
      session.participant.toString() === req.user._id.toString();
    if (!isParty) return res.status(403).json({ message: "Not authorized" });

    session.status = status;
    await session.save();
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const isParty =
      session.organizer.toString() === req.user._id.toString() ||
      session.participant.toString() === req.user._id.toString();
    if (!isParty) return res.status(403).json({ message: "Not authorized" });

    await session.deleteOne();
    res.json({ message: "Session removed" });
  } catch (error) {
    next(error);
  }
};
