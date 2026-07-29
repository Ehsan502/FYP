import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function ResetPassword() {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.put(`/auth/reset-password/${resetToken}`, { password });
      setMessage(res.data.message || "Password updated successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
        <h2 className="text-2xl font-bold text-center mb-2">Reset Password</h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          Enter your new password below.
        </p>

        {message && <div className="p-3 mb-4 text-sm text-green-400 bg-green-950/50 border border-green-800 rounded-lg">{message}</div>}
        {error && <div className="p-3 mb-4 text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-teal-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-teal-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 font-semibold rounded-lg transition"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}