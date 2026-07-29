import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Repeat2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import BadgeChip from "../components/BadgeChip.jsx";
import { SkeletonRow } from "../components/Skeleton.jsx";

const medalColor = { 1: "text-yellow-400", 2: "text-slate-300", 3: "text-amber-600" };

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users/leaderboard")
      .then((res) => setLeaders(res.data))
      .catch(() => toast.error("Could not load leaderboard"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Trophy size={26} />
        </div>
        <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
        <p className="mt-1 text-muted-light dark:text-muted-dark">Top community members by points earned.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leaders.map((l, i) => (
            <motion.div
              key={l._id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`card flex items-center gap-4 p-5 ${l._id === user?._id ? "ring-2 ring-primary" : ""}`}
            >
              <span className={`w-8 text-center font-display text-xl font-bold ${medalColor[l.rank] || "text-muted-light dark:text-muted-dark"}`}>
                {l.rank}
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                {l.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium">{l.name}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-light dark:text-muted-dark">
                  <span className="flex items-center gap-1"><Star size={11} className="fill-accent text-accent" /> {l.rating?.toFixed(1) || "New"}</span>
                  <span className="flex items-center gap-1"><Repeat2 size={11} /> {l.completedSwaps} swaps</span>
                  <span className="font-mono">{l.level?.name}</span>
                </div>
                {l.badges?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {l.badges.slice(0, 3).map((b) => <BadgeChip key={b} badgeKey={b} />)}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-bold text-primary">{l.points}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-light dark:text-muted-dark">points</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
