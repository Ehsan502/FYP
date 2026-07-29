import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, Plus, X, MapPin, Video, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { SkeletonRow } from "../components/Skeleton.jsx";
import AvailabilityEditor from "../components/AvailabilityEditor.jsx";

const getUpcomingWeekend = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = (6 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  d.setHours(10, 0, 0, 0);
  return d.toISOString().slice(0, 16);
};

const Schedule = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [acceptedSwaps, setAcceptedSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    swapRequestId: "",
    title: "",
    slotType: "Weekend", // Options: Weekend, Weekday, Flexible
    scheduledAt: getUpcomingWeekend(),
    durationMinutes: 60,
    mode: "online",
    location: "",
    notes: ""
  });

  const load = async () => {
    setLoading(true);
    try {
      const [sessionsRes, swapsRes] = await Promise.all([api.get("/sessions/mine"), api.get("/swaps/mine")]);
      setSessions(sessionsRes.data);
      const accepted = [...swapsRes.data.incoming, ...swapsRes.data.outgoing].filter(
        (s) => s.status === "accepted" || s.status === "completed"
      );
      setAcceptedSwaps(accepted);
    } catch (err) {
      toast.error("Could not load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/sessions", form);
      toast.success("Session scheduled!");
      setForm({ ...form, swapRequestId: "", title: "", notes: "", scheduledAt: getUpcomingWeekend() });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not schedule session");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/sessions/${id}`, { status });
      toast.success(`Session marked ${status}`);
      load();
    } catch (err) {
      toast.error("Could not update session");
    }
  };

  const removeSession = async (id) => {
    try {
      await api.delete(`/sessions/${id}`);
      toast.success("Session removed");
      load();
    } catch (err) {
      toast.error("Could not remove session");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Schedule</h1>
          <p className="mt-1 text-muted-light dark:text-muted-dark">Book weekend or daily skill exchange sessions.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary" disabled={acceptedSwaps.length === 0}>
          <Plus size={18} /> Book Session
        </button>
      </div>

      <AvailabilityEditor />

      {loading ? (
        <div className="flex flex-col gap-3 mt-6">{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No sessions scheduled"
          description="Once a swap is accepted, book a session to lock in a time to meet."
        />
      ) : (
        <div className="flex flex-col gap-4 mt-6">
          {sessions.map((s) => {
            const partner = s.organizer?._id === user?._id ? s.participant : s.organizer;
            return (
              <motion.div key={s._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-primary/10 text-primary font-medium">{format(new Date(s.scheduledAt), "MMM d, yyyy • h:mm a")}</span>
                    <span className="badge bg-black/5 dark:bg-white/5">{s.durationMinutes} min</span>
                  </div>
                  <h3 className="mt-2 font-display font-semibold text-lg">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-light dark:text-muted-dark">with {partner?.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-light dark:text-muted-dark">
                    {s.mode === "online" ? <Video size={12} /> : <MapPin size={12} />} {s.mode === "online" ? "Online" : s.location || "In person"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge uppercase text-[10px] tracking-wider ${s.status === "scheduled" ? "bg-primary/10 text-primary" : s.status === "completed" ? "bg-purple-500/10 text-purple-400" : "bg-rose-500/10 text-rose-400"}`}>
                    {s.status}
                  </span>
                  {s.status === "scheduled" && (
                    <>
                      <button onClick={() => updateStatus(s._id, "completed")} className="btn-secondary !px-3 !py-1.5 text-xs">Done</button>
                      <button onClick={() => updateStatus(s._id, "cancelled")} className="btn-secondary !px-3 !py-1.5 text-xs">Cancel</button>
                    </>
                  )}
                  <button onClick={() => removeSession(s._id)} className="text-muted-light dark:text-muted-dark hover:text-rose-500 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg card p-6"
            >
              <div className="mb-4 flex items-center justify-between border-b pb-3 border-gray-700/50">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Calendar size={18} className="text-primary" /> Book Session
                </h3>
                <button onClick={() => setShowForm(false)} className="text-muted-light dark:text-muted-dark hover:text-primary">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-muted-light dark:text-muted-dark mb-1 block">Select Swap Partner</label>
                  <select name="swapRequestId" required value={form.swapRequestId} onChange={handleChange} className="input-field">
                    <option value="">Select an accepted swap</option>
                    {acceptedSwaps.map((s) => {
                      const partner = s.requester?._id === user?._id ? s.receiver : s.requester;
                      return (
                        <option key={s._id} value={s._id}>
                          {s.skillRequested?.title} with {partner?.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-light dark:text-muted-dark mb-1 block">Session Type</label>
                    <select name="slotType" value={form.slotType} onChange={handleChange} className="input-field">
                      <option value="Weekend">Weekend (Sat / Sun)</option>
                      <option value="Weekday">Weekday (Mon - Fri)</option>
                      <option value="Flexible">Flexible / Anytime</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-light dark:text-muted-dark mb-1 block">Session Title</label>
                    <input name="title" required placeholder="e.g. React Basics" value={form.title} onChange={handleChange} className="input-field" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-light dark:text-muted-dark mb-1 block">Date & Time</label>
                    <input type="datetime-local" name="scheduledAt" required value={form.scheduledAt} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-light dark:text-muted-dark mb-1 block">Duration (Mins)</label>
                    <input type="number" name="durationMinutes" min="15" step="15" value={form.durationMinutes} onChange={handleChange} className="input-field" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-light dark:text-muted-dark mb-1 block">Mode</label>
                    <select name="mode" value={form.mode} onChange={handleChange} className="input-field">
                      <option value="online">Online</option>
                      <option value="in-person">In-person</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-light dark:text-muted-dark mb-1 block">Meeting Link / Location</label>
                    <input name="location" placeholder="Google Meet / Address" value={form.location} onChange={handleChange} className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-light dark:text-muted-dark mb-1 block">Notes (Optional)</label>
                  <textarea name="notes" placeholder="Agenda or preparation guidelines..." value={form.notes} onChange={handleChange} className="input-field min-h-[70px] resize-none" />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
                  {submitting ? "Booking..." : "Confirm & Book Session"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Schedule;