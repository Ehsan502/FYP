import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";

const ReportModal = ({ targetType, targetId, onClose }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await api.post("/reports", {
        targetType,
        targetUserId: targetType === "user" ? targetId : undefined,
        targetSkillId: targetType === "skill" ? targetId : undefined,
        reason,
      });
      toast.success("Report submitted. Our team will review it.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit report");
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
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md card p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-rose-400">
              <Flag size={18} /> Report {targetType}
            </h3>
            <button onClick={onClose} className="text-muted-light dark:text-muted-dark hover:text-primary">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <textarea
              required
              className="input-field min-h-[100px] resize-none"
              placeholder="Describe the issue..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-primary w-full !bg-rose-500 hover:!shadow-none">
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportModal;
