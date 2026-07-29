import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Clock, Save } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AvailabilityEditor = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: "Mon",
    startTime: "18:00",
    endTime: "20:00",
  });

  useEffect(() => {
    api
      .get("/availability/mine")
      .then((res) => setSlots(res.data.slots || []))
      .catch(() => toast.error("Could not load availability"))
      .finally(() => setLoading(false));
  }, []);

  const addSlot = () => {
    setSlots((prev) => [...prev, { ...newSlot }]);
  };

  const removeSlot = (index) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
    setSlots((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/availability/mine", { slots });
      toast.success("Availability updated!");
    } catch (err) {
      toast.error("Could not save availability");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-10 p-6 bg-[#0f172a]/90 border border-gray-800 rounded-2xl text-white"
    >
      <div className="mb-4 flex items-center gap-2">
        <Clock size={18} className="text-emerald-400" />
        <h2 className="font-display text-lg font-semibold">Weekly Availability</h2>
      </div>

      {slots.length === 0 ? (
        <p className="mb-4 text-sm text-gray-400">
          No availability set. Add slots below so others know when you're free.
        </p>
      ) : (
        <div className="mb-6 flex flex-col gap-3">
          {slots.map((s, i) => (
            <div
              key={i}
              className="flex flex-wrap sm:flex-nowrap items-center gap-3 rounded-xl bg-gray-900/80 border border-gray-800 px-4 py-3 text-sm"
            >
              {/* Day Selection */}
              <select
                value={s.day}
                onChange={(e) => updateSlot(i, "day", e.target.value)}
                className="bg-gray-800 text-white rounded-lg px-3 py-1.5 border border-gray-700 text-sm outline-none focus:border-emerald-500"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Start Time Input */}
              <input
                type="time"
                value={s.startTime}
                onChange={(e) => updateSlot(i, "startTime", e.target.value)}
                className="bg-gray-800 text-white rounded-lg px-3 py-1.5 border border-gray-700 text-sm outline-none focus:border-emerald-500"
              />

              <span className="text-gray-400 text-xs">to</span>

              {/* End Time Input */}
              <input
                type="time"
                value={s.endTime}
                onChange={(e) => updateSlot(i, "endTime", e.target.value)}
                className="bg-gray-800 text-white rounded-lg px-3 py-1.5 border border-gray-700 text-sm outline-none focus:border-emerald-500"
              />

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeSlot(i)}
                className="ml-auto text-gray-400 hover:text-rose-500 p-1 transition"
                title="Remove slot"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Slot Controls */}
      <div className="pt-2 border-t border-gray-800 flex flex-wrap items-center gap-3">
        <select
          value={newSlot.day}
          onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
          className="bg-gray-800 text-white rounded-xl px-3 py-2 border border-gray-700 text-sm outline-none focus:border-emerald-500"
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <input
          type="time"
          value={newSlot.startTime}
          onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
          className="bg-gray-800 text-white rounded-xl px-3 py-2 border border-gray-700 text-sm outline-none focus:border-emerald-500"
        />

        <input
          type="time"
          value={newSlot.endTime}
          onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
          className="bg-gray-800 text-white rounded-xl px-3 py-2 border border-gray-700 text-sm outline-none focus:border-emerald-500"
        />

        <button
          type="button"
          onClick={addSlot}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl border border-gray-700 transition"
        >
          <Plus size={16} /> Add
        </button>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl transition ml-auto"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save Availability"}
        </button>
      </div>
    </motion.div>
  );
};

export default AvailabilityEditor;