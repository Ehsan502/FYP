import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Flag } from "lucide-react";
import ReportModal from "./ReportModal.jsx";

const levelColor = {
  Beginner: "bg-primary/10 text-primary",
  Intermediate: "bg-accent/10 text-accent",
  Advanced: "bg-purple-500/10 text-purple-400",
  Expert: "bg-rose-500/10 text-rose-400",
};

const SkillCard = ({ skill, onRequest }) => {
  const [showReport, setShowReport] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="card group flex flex-col gap-4 p-6"
    >
      <div className="flex items-start justify-between">
        <span className="badge bg-primary/10 text-primary">{skill.category}</span>
        <div className="flex items-center gap-2">
          <span className={`badge ${levelColor[skill.level] || "bg-primary/10 text-primary"}`}>{skill.level}</span>
          <button
            onClick={() => setShowReport(true)}
            className="text-muted-light dark:text-muted-dark opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
            aria-label="Report skill"
          >
            <Flag size={14} />
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">{skill.title}</h3>
        <p className="mt-1 text-sm text-muted-light dark:text-muted-dark line-clamp-3">{skill.description}</p>
      </div>

      {skill.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skill.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-1 text-xs font-mono text-muted-light dark:text-muted-dark">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-display text-xs font-bold text-primary">
            {skill.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="text-xs">
            <p className="font-medium">{skill.user?.name}</p>
            <div className="flex items-center gap-2 text-muted-light dark:text-muted-dark">
              <span className="flex items-center gap-0.5"><Star size={11} className="fill-accent text-accent" /> {skill.user?.rating?.toFixed(1) || "New"}</span>
              {skill.user?.location && (
                <span className="flex items-center gap-0.5"><MapPin size={11} /> {skill.user.location}</span>
              )}
            </div>
          </div>
        </div>
        {onRequest && (
          <button onClick={() => onRequest(skill)} className="btn-primary !px-4 !py-2 text-xs">
            Request
          </button>
        )}
      </div>

      {showReport && <ReportModal targetType="skill" targetId={skill._id} onClose={() => setShowReport(false)} />}
    </motion.div>
  );
};

export default SkillCard;
