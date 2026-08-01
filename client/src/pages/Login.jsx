import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // 2FA Security Challenge States
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [expectedAnswer, setExpectedAnswer] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Initial Login Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      if (data.requires2FA) {
        setCaptchaQuestion(data.question);
        setExpectedAnswer(data.expectedAnswer);
        setShow2FAModal(true);
      } else {
        login(data);
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // 2FA Verification Submission
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
        captchaAnswer: userAnswer,
        expectedAnswer,
      });

      login(data);
      toast.success("2FA Verified! Welcome back.");
      setShow2FAModal(false);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect answer. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-md p-8 relative"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size={40} />
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark">Sign in to continue swapping skills</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
            <input
              type="email"
              name="email"
              required
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className="input-field pl-11"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="input-field pl-11"
            />
          </div>

          <div className="flex justify-end text-sm mt-1">
            <Link to="/forgot-password" className="text-teal-400 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full flex items-center justify-center gap-2">
            {loading ? "Checking..." : "Sign In"} <ArrowRight size={17} />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-light dark:text-muted-dark">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>

        {/* --- 2FA Challenge Modal Popup --- */}
        {show2FAModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card w-full max-w-sm p-6 text-center border-primary/20 shadow-2xl"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-display text-lg font-bold">2FA Security Challenge</h3>
              <p className="text-xs text-muted-light dark:text-muted-dark my-2">
                Solve this simple math question to verify your identity:
              </p>

              <form onSubmit={handleVerify2FA} className="mt-4 flex flex-col gap-4">
                <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3 font-mono text-2xl font-bold text-primary">
                  {captchaQuestion}
                </div>

                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter Answer"
                  required
                  autoFocus
                  className="input-field text-center text-lg tracking-widest"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShow2FAModal(false)}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 py-2 text-xs"
                  >
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;