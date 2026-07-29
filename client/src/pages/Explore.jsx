import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Compass } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import SkillCard from "../components/SkillCard.jsx";
import RequestModal from "../components/RequestModal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { SkeletonGrid } from "../components/Skeleton.jsx";

const CATEGORIES = ["All", "Technology", "Design", "Music", "Language", "Business", "Fitness", "Art", "Cooking", "Other"];

const Explore = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState(null);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const params = { excludeMine: user ? "true" : "false" };
      if (search) params.search = search;
      if (category !== "All") params.category = category;
      const res = await api.get("/skills", { params });
      setSkills(res.data);
    } catch (err) {
      toast.error("Could not load skills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchSkills, 350);
    return () => clearTimeout(delay);
  }, [search, category]);

  const handleRequest = (skill) => {
    if (!user) {
      toast.error("Please sign in to request a swap");
      return;
    }
    setSelectedSkill(skill);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-10 text-center">
        <h1 className="font-display text-2xl sm:text-4xl font-bold">Explore Skills</h1>
        <p className="mt-1 text-xs sm:text-base text-muted-light dark:text-muted-dark">Find someone to trade knowledge with.</p>
      </motion.div>

      {/* Responsive Search & Scrollable Category Bar */}
      <div className="mb-6 sm:mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills, tags, categories..."
            className="input-field pl-11"
          />
        </div>

        {/* Horizontally Scrollable Categories for Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors flex-shrink-0 ${
                category === c
                  ? "bg-primary text-base-dark font-bold"
                  : "bg-black/5 dark:bg-white/5 text-muted-light dark:text-muted-dark hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : skills.length === 0 ? (
        <EmptyState icon={Compass} title="No skills found" description="Try a different search term or category filter." />
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill._id} skill={skill} onRequest={handleRequest} />
          ))}
        </div>
      )}

      {selectedSkill && (
        <RequestModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} onSuccess={fetchSkills} />
      )}
    </div>
  );
};

export default Explore;