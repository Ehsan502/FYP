import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Star, Repeat2, Zap, Github, Linkedin, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import AvatarUpload from "../components/AvatarUpload.jsx";
import BadgeChip from "../components/BadgeChip.jsx";
import StarRating from "../components/StarRating.jsx";

const EXPERIENCE_LEVELS = ["", "Beginner", "Intermediate", "Advanced", "Expert"];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    experienceLevel: user?.experienceLevel || "",
    education: user?.education || "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
    skillsOffered: user?.skillsOffered?.join(", ") || "",
    skillsWanted: user?.skillsWanted?.join(", ") || "",
    portfolioLinks: user?.portfolioLinks?.join(", ") || "",
    languages: user?.languages?.join(", ") || "",
  });
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (user?._id) {
      api.get(`/reviews/user/${user._id}`).then((res) => setReviews(res.data)).catch(() => {});
    }
  }, [user?._id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        bio: form.bio,
        location: form.location,
        experienceLevel: form.experienceLevel,
        education: form.education,
        linkedin: form.linkedin,
        github: form.github,
        skillsOffered: form.skillsOffered.split(",").map((s) => s.trim()).filter(Boolean),
        skillsWanted: form.skillsWanted.split(",").map((s) => s.trim()).filter(Boolean),
        portfolioLinks: form.portfolioLinks.split(",").map((s) => s.trim()).filter(Boolean),
        languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const res = await api.put("/users/profile", payload);
      updateUser(res.data);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
        <div className="mb-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <AvatarUpload user={user} onUploaded={updateUser} />
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">{user?.name}</h1>
            <p className="text-sm text-muted-light dark:text-muted-dark">{user?.email}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm sm:justify-start">
              <span className="flex items-center gap-1"><Star size={14} className="fill-accent text-accent" /> {user?.rating?.toFixed(1) || "New"} ({user?.ratingCount || 0})</span>
              <span className="flex items-center gap-1"><Repeat2 size={14} className="text-primary" /> {user?.completedSwaps || 0} swaps</span>
              <span className="flex items-center gap-1"><Zap size={14} className="text-accent" /> {user?.points || 0} pts · {user?.level?.name}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-light dark:text-muted-dark">
            <span>Profile completion</span>
            <span>{user?.profileCompletion || 0}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${user?.profileCompletion || 0}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        {user?.badges?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {user.badges.map((b) => <BadgeChip key={b} badgeKey={b} />)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} className="input-field" />
            <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="input-field" />
          </div>
          <textarea name="bio" placeholder="Short bio" value={form.bio} onChange={handleChange} className="input-field min-h-[90px] resize-none" />

          <div className="grid gap-4 sm:grid-cols-2">
            <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange} className="input-field">
              <option value="">Experience level</option>
              {EXPERIENCE_LEVELS.filter(Boolean).map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <input name="education" placeholder="Education (e.g. BSc Computer Science)" value={form.education} onChange={handleChange} className="input-field" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <Linkedin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
              <input name="linkedin" placeholder="LinkedIn URL" value={form.linkedin} onChange={handleChange} className="input-field pl-11" />
            </div>
            <div className="relative">
              <Github size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
              <input name="github" placeholder="GitHub URL" value={form.github} onChange={handleChange} className="input-field pl-11" />
            </div>
          </div>

          <div className="relative">
            <LinkIcon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
            <input name="portfolioLinks" placeholder="Portfolio links (comma separated)" value={form.portfolioLinks} onChange={handleChange} className="input-field pl-11" />
          </div>

          <input name="languages" placeholder="Languages you speak (comma separated)" value={form.languages} onChange={handleChange} className="input-field" />
          <input name="skillsOffered" placeholder="Skills you can teach (comma separated)" value={form.skillsOffered} onChange={handleChange} className="input-field" />
          <input name="skillsWanted" placeholder="Skills you want to learn (comma separated)" value={form.skillsWanted} onChange={handleChange} className="input-field" />

          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full sm:w-fit">
            <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </motion.div>

      {reviews.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-display text-lg font-semibold">Reviews Received</h2>
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r._id} className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{r.reviewer?.name}</p>
                  <StarRating value={r.rating} readOnly size={15} />
                </div>
                {r.comment && <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
