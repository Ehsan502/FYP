import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
      if (res.data.resetUrl) {
        setResetUrl(res.data.resetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
        <h2 className="text-2xl font-bold text-center mb-2">Forgot Password</h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          Enter your email to receive a password reset link.
        </p>

        {message && <div className="p-3 mb-4 text-sm text-green-400 bg-green-950/50 border border-green-800 rounded-lg">{message}</div>}
        {error && <div className="p-3 mb-4 text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-teal-500"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 font-semibold rounded-lg transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {resetUrl && (
          <div className="mt-4 p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs break-all">
            <span className="text-slate-400 block mb-1">Demo Mode Link (Copy this):</span>
            <a href={resetUrl} className="text-teal-400 underline">{resetUrl}</a>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-slate-400">
          Remember your password?{" "}
          <Link to="/login" className="text-teal-400 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}