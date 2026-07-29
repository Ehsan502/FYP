import Review from "../models/Review.js";
import SwapRequest from "../models/SwapRequest.js";
import User from "../models/User.js";
import { createNotification } from "../utils/notify.js";
import { awardPoints } from "../utils/gamification.js";

export const createReview = async (req, res, next) => {
  try {
    const { swapRequestId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const swap = await SwapRequest.findById(swapRequestId);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });
    if (swap.status !== "completed") {
      return res.status(400).json({ message: "You can only review completed swaps" });
    }

    const isRequester = swap.requester.toString() === req.user._id.toString();
    const isReceiver = swap.receiver.toString() === req.user._id.toString();
    if (!isRequester && !isReceiver) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if ((isRequester && swap.reviewedByRequester) || (isReceiver && swap.reviewedByReceiver)) {
      return res.status(400).json({ message: "You already reviewed this swap" });
    }

    const revieweeId = isRequester ? swap.receiver : swap.requester;

    const review = await Review.create({
      swapRequest: swap._id,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating,
      comment,
    });

    if (isRequester) swap.reviewedByRequester = true;
    else swap.reviewedByReceiver = true;
    await swap.save();

    const reviewee = await User.findById(revieweeId);
    const allReviews = await Review.find({ reviewee: revieweeId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    reviewee.rating = Number(avgRating.toFixed(2));
    reviewee.ratingCount = allReviews.length;
    reviewee.trustScore = Number((avgRating * 20).toFixed(1)); // 0-100 scale
    reviewee._skillCount = reviewee.skillsOffered?.length || 0;
    reviewee.recalculateBadges();
    await reviewee.save();

    await awardPoints(revieweeId, 10, "Received a review");

    await createNotification({
      user: revieweeId,
      sender: req.user._id,
      type: "review",
      text: `${req.user.name} left you a ${rating}-star review`,
      link: "/profile",
      relatedId: review._id,
    });

    const populated = await review.populate("reviewer", "name avatar");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "name avatar")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};
