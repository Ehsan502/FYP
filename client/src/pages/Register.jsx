import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", skillsOffered: "", skillsWanted: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        skillsOffered: form.skillsOffered.split(",").map((s) => s.trim()).filter(Boolean),
        skillsWanted: form.skillsWanted.split(",").map((s) => s.trim()).filter(Boolean),
      });
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
        className="card w-full max-w-md p-8"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size={40} />
          <h1 className="font-display text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark">Start swapping skills in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
            <input name="name" required placeholder="Full name" value={form.name} onChange={handleChange} className="input-field pl-11" />
          </div>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
            <input type="email" name="email" required placeholder="Email address" value={form.email} onChange={handleChange} className="input-field pl-11" />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
            <input type="password" name="password" required minLength={6} placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} className="input-field pl-11" />
          </div>
          <input name="skillsOffered" placeholder="Skills you can teach (comma separated)" value={form.skillsOffered} onChange={handleChange} className="input-field" />
          <input name="skillsWanted" placeholder="Skills you want to learn (comma separated)" value={form.skillsWanted} onChange={handleChange} className="input-field" />

          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
            {loading ? "Creating account..." : "Create Account"} <ArrowRight size={17} />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-light dark:text-muted-dark">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
