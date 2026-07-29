import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import api from "../api/axios.js";

const RequestModal = ({ skill, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [skillOffered, setSkillOffered] = useState(user?.skillsOffered?.[0] || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!skillOffered) {
      toast.error("Please mention a skill you can offer in exchange");
      return;
    }
    setLoading(true);
    try {
      await api.post("/swaps", { skillId: skill._id, skillOffered, message });
      toast.success("Swap request sent!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send request");
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
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Request "{skill.title}"</h3>
            <button onClick={onClose} className="text-muted-light dark:text-muted-dark hover:text-primary">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-light dark:text-muted-dark">
                Skill you'll offer in exchange
              </label>
              <input
                className="input-field"
                value={skillOffered}
                onChange={(e) => setSkillOffered(e.target.value)}
                placeholder="e.g. Guitar lessons"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-light dark:text-muted-dark">
                Message (optional)
              </label>
              <textarea
                className="input-field min-h-[90px] resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say hi and explain what you're looking for..."
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Sending..." : "Send Request"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RequestModal;
