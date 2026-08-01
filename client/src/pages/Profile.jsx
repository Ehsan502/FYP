import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Save, Star, Repeat2, Zap, Github, Linkedin, 
  Link as LinkIcon, KeyRound, ShieldAlert, Trash2, Smartphone, ShieldCheck 
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import AvatarUpload from "../components/AvatarUpload.jsx";
import BadgeChip from "../components/BadgeChip.jsx";
import StarRating from "../components/StarRating.jsx";

const EXPERIENCE_LEVELS = ["", "Beginner", "Intermediate", "Advanced", "Expert"];

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form State
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

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // 2FA States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [toggling2FA, setToggling2FA] = useState(false);

  // Delete Account States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?._id) {
      api.get(`/reviews/user/${user._id}`).then((res) => setReviews(res.data)).catch(() => {});
    }
  }, [user?._id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 1. Submit Profile Update
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

  // 2. Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters long");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match!");
    }

    setChangingPassword(true);
    try {
      await api.put("/users/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // 3. Toggle 2FA
  const handleToggle2FA = async () => {
    setToggling2FA(true);
    try {
      const nextStatus = !twoFactorEnabled;
      const res = await api.put("/users/toggle-2fa", { enabled: nextStatus });
      setTwoFactorEnabled(nextStatus);
      if (updateUser) updateUser(res.data);
      toast.success(nextStatus ? "2-Factor Authentication Enabled!" : "2-Factor Authentication Disabled!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update 2FA setting");
    } finally {
      setToggling2FA(false);
    }
  };

  // 4. Delete Account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      return toast.error("Please enter your password to confirm deletion");
    }

    setDeleting(true);
    try {
      await api.delete("/users/account", {
        data: { password: deletePassword },
      });
      toast.success("Account deleted successfully");
      logout();
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* Main Profile Info Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 sm:p-8">
        
        {/* Header User Details */}
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

        {/* Profile Completion Bar */}
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

        {/* Badges */}
        {user?.badges?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {user.badges.map((b) => <BadgeChip key={b} badgeKey={b} />)}
          </div>
        )}

        {/* Profile Edit Form */}
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

      {/* --- Change Password Section --- */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
          <KeyRound className="text-primary" size={20} />
          <h2 className="text-lg font-bold">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input-field"
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button type="submit" disabled={changingPassword} className="btn-primary mt-2 w-full sm:w-fit">
            <KeyRound size={16} /> {changingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </motion.div>

      {/* --- 2-Factor Authentication (2FA) Section --- */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <Smartphone className="text-primary" size={20} />
            <div>
              <h2 className="text-lg font-bold">Two-Factor Authentication (2FA)</h2>
              <p className="text-xs text-muted-light dark:text-muted-dark">
                Add an extra layer of security to your account during sign in.
              </p>
            </div>
          </div>
          {twoFactorEnabled && (
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <ShieldCheck size={14} /> Active
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed max-w-md">
            {twoFactorEnabled 
              ? "2FA active hai. Har naye login attempt par confirmation code require hoga." 
              : "2-Factor Authentication turn on karein taake login security mazeed strong ho sake."}
          </p>
          <button
            onClick={handleToggle2FA}
            disabled={toggling2FA}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              twoFactorEnabled 
                ? "bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-ink-light dark:text-ink-dark" 
                : "btn-primary"
            }`}
          >
            {toggling2FA 
              ? "Updating..." 
              : twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
          </button>
        </div>
      </motion.div>

      {/* --- Danger Zone / Delete Account Section --- */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6 sm:p-8 border-red-500/20 bg-red-500/5">
        <div className="flex items-center justify-between pb-4 border-b border-red-500/10">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="text-red-500" size={20} />
            <div>
              <h2 className="text-lg font-bold text-red-500">Danger Zone</h2>
              <p className="text-xs text-muted-light dark:text-muted-dark">
                Permanently delete your profile and all associated data.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Delete Account</p>
            <p className="text-xs text-muted-light dark:text-muted-dark">
              Once deleted, your account and history cannot be recovered.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Trash2 size={15} /> Delete Account
          </button>
        </div>
      </motion.div>

      {/* --- Delete Account Confirmation Modal --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-6 max-w-md w-full border-red-500/30">
            <h3 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-2">
              <ShieldAlert size={22} /> Confirm Account Deletion
            </h3>
            <p className="text-xs text-muted-light dark:text-muted-dark mb-4 leading-relaxed">
              Are you sure? This action is permanent and will delete all your skills, chats, and records.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1">Enter your password to confirm:</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter password"
                className="input-field w-full"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white"
              >
                {deleting ? "Deleting..." : "Yes, Delete My Account"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reviews Received Section */}
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