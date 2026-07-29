import { useEffect, useState } from "react";
import { Shield, UserX, UserCheck, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      toast.error("Could not load users for Admin Panel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleBlockStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/block`);
      toast.success("User status updated!");
      loadUsers();
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={28} className="text-primary" />
        <h1 className="text-2xl font-bold">Admin Management Panel</h1>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">All Users Management</h2>
        
        {loading ? (
          <p className="text-sm text-gray-400">Loading users...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <div key={u._id} className="flex items-center justify-between border-b pb-3 border-gray-700/50">
                <div>
                  <p className="font-medium text-sm">{u.name} <span className="text-xs text-gray-400">({u.email})</span></p>
                  <p className="text-xs text-gray-500">Role: {u.role} | Status: {u.isBlocked ? "Banned" : "Active"}</p>
                </div>
                <button
                  onClick={() => toggleBlockStatus(u._id)}
                  className={`btn-secondary !px-3 !py-1 text-xs ${u.isBlocked ? "text-green-400" : "text-rose-400"}`}
                >
                  {u.isBlocked ? <><UserCheck size={14} /> Unblock</> : <><UserX size={14} /> Ban User</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;