import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Star, Repeat2, BookOpen, Zap, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import BadgeChip from "../components/BadgeChip.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { SkeletonGrid } from "../components/Skeleton.jsx";

const CATEGORIES = ["Technology", "Design", "Music", "Language", "Business", "Fitness", "Art", "Cooking", "Other"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

const emptyForm = { title: "", category: "Technology", description: "", level: "Intermediate", tags: "", availability: "Flexible" };

const StatCard = ({ icon: Icon, label, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card flex items-center gap-3.5 sm:gap-4 p-4 sm:p-6"
  >
    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
      <Icon size={20} />
    </div>
    <div className="min-w-0">
      <p className="font-display text-xl sm:text-2xl font-bold truncate">{value}</p>
      <p className="text-xs text-muted-light dark:text-muted-dark truncate">{label}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [mySkills, setMySkills] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, skillsRes, recRes] = await Promise.all([
        api.get("/users/dashboard"),
        api.get("/skills/mine"),
        api.get("/recommendations/users"),
      ]);
      setStats(statsRes.data);
      setMySkills(skillsRes.data);
      setRecommendedUsers(recRes.data);
    } catch (err) {
      toast.error("Could not load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/skills", { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) });
      toast.success("Skill posted!");
      setForm(emptyForm);
      setShowForm(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not post skill");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/skills/${id}`);
      toast.success("Skill removed");
      loadData();
    } catch (err) {
      toast.error("Could not delete skill");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        <SkeletonGrid count={6} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-14">
      {/* Welcome Banner */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-light dark:text-muted-dark">Here's what's happening with your skills.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary w-full sm:w-auto">
          <Plus size={18} /> Post a Skill
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="mb-8 grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Skills Offered" value={stats?.totalSkillsOffered ?? mySkills.length} delay={0} />
        <StatCard icon={Repeat2} label="Completed Swaps" value={stats?.completedSwaps ?? 0} delay={0.05} />
        <StatCard icon={Star} label="Rating" value={stats?.rating ? stats.rating.toFixed(1) : "New"} delay={0.1} />
        <StatCard icon={Zap} label={`Points · ${stats?.level?.name || ""}`} value={stats?.points ?? 0} delay={0.15} />
      </div>

      {/* Badges List */}
      {stats?.badges?.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          {stats.badges.map((b) => <BadgeChip key={b} badgeKey={b} />)}
        </div>
      )}

      {/* Recommendations */}
      {recommendedUsers.length > 0 && (
        <div className="mb-10 sm:mb-12">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-accent" />
            <h2 className="font-display text-lg sm:text-xl font-semibold">Recommended for You</h2>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedUsers.map(({ user: u, mutualMatch }) => (
              <motion.div key={u._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary flex-shrink-0">
                    {u.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{u.name}</p>
                    {mutualMatch && <span className="badge bg-accent/10 text-accent !px-2 !py-0.5 text-[10px]">Mutual Match</span>}
                  </div>
                </div>
                {u.skillsOffered?.length > 0 && (
                  <p className="mt-3 text-xs text-muted-light dark:text-muted-dark truncate">Teaches: {u.skillsOffered.slice(0, 3).join(", ")}</p>
                )}
                <Link to={`/chat?user=${u._id}`} className="btn-secondary mt-3 w-full !py-1.5 text-xs">
                  Message
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Posted Skills */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <h2 className="font-display text-lg sm:text-xl font-semibold">Your Posted Skills</h2>
      </div>

      {mySkills.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No skills posted yet"
          description="Post your first skill so others can find and request it."
          action={<button onClick={() => setShowForm(true)} className="btn-primary">Post a Skill</button>}
        />
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {mySkills.map((skill) => (
            <motion.div key={skill._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <span className="badge bg-primary/10 text-primary">{skill.category}</span>
                <button onClick={() => handleDelete(skill._id)} className="text-muted-light dark:text-muted-dark hover:text-rose-500 transition-colors p-1">
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="mt-3 font-display text-base sm:text-lg font-semibold">{skill.title}</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-light dark:text-muted-dark line-clamp-2">{skill.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {skill.tags?.map((tag, i) => (
                  <span key={i} className="rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-0.5 text-[11px] font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Post Skill Modal (Touch Friendly) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg card max-h-[85vh] overflow-y-auto p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-base sm:text-lg font-semibold">Post a New Skill</h3>
                <button onClick={() => setShowForm(false)} className="text-muted-light dark:text-muted-dark hover:text-primary p-1">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <input name="title" required placeholder="Skill title e.g. Guitar Basics" value={form.title} onChange={handleChange} className="input-field" />
                <div className="grid grid-cols-2 gap-3">
                  <select name="category" value={form.category} onChange={handleChange} className="input-field">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select name="level" value={form.level} onChange={handleChange} className="input-field">
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <textarea name="description" required placeholder="Describe what you teach..." value={form.description} onChange={handleChange} className="input-field min-h-[90px] resize-none" />
                <input name="tags" placeholder="Tags (comma separated)" value={form.tags} onChange={handleChange} className="input-field" />
                <input name="availability" placeholder="Availability e.g. Weekends" value={form.availability} onChange={handleChange} className="input-field" />
                <button type="submit" disabled={submitting} className="btn-primary w-full mt-1">
                  {submitting ? "Posting..." : "Post Skill"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;