import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import StarRating from "./StarRating.jsx";

const ReviewModal = ({ swap, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/reviews", { swapRequestId: swap._id, rating, comment });
      toast.success("Review submitted!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md card p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Rate your experience</h3>
            <button onClick={onClose} className="text-muted-light dark:text-muted-dark hover:text-primary">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3">
              <StarRating value={rating} onChange={setRating} size={30} />
              <p className="text-sm text-muted-light dark:text-muted-dark">{rating} out of 5 stars</p>
            </div>
            <textarea
              className="input-field min-h-[90px] resize-none"
              placeholder="Share how the swap went (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewModal;
