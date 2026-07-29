import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard, Compass, User as UserIcon, MessageSquare, Trophy, ShieldCheck, CalendarClock, Award } from "lucide-react";
import ThemeToggle from "./ThemeToggle.jsx";
import NotificationBell from "./NotificationBell.jsx";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-ink-light/70 dark:text-ink-dark/70 hover:text-primary"}`;

  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <Logo />
          SkillSwap
        </Link>

        <div className="hidden items-center gap-5 xl:flex">
          <NavLink to="/explore" className={linkClass}>
            <span className="inline-flex items-center gap-1.5"><Compass size={16} /> Explore</span>
          </NavLink>
          <NavLink to="/leaderboard" className={linkClass}>
            <span className="inline-flex items-center gap-1.5"><Trophy size={16} /> Leaderboard</span>
          </NavLink>
          {user && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                <span className="inline-flex items-center gap-1.5"><LayoutDashboard size={16} /> Dashboard</span>
              </NavLink>
              <NavLink to="/requests" className={linkClass}>Requests</NavLink>
              <NavLink to="/chat" className={linkClass}>
                <span className="inline-flex items-center gap-1.5"><MessageSquare size={16} /> Chat</span>
              </NavLink>
              <NavLink to="/schedule" className={linkClass}>
                <span className="inline-flex items-center gap-1.5"><CalendarClock size={16} /> Schedule</span>
              </NavLink>
              <NavLink to="/certificates" className={linkClass}>
                <span className="inline-flex items-center gap-1.5"><Award size={16} /> Certificates</span>
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                <span className="inline-flex items-center gap-1.5"><UserIcon size={16} /> Profile</span>
              </NavLink>
              {user.role === "admin" && (
                <NavLink to="/admin" className={linkClass}>
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck size={16} /> Admin</span>
                </NavLink>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && <NotificationBell />}
          {user ? (
            <button onClick={handleLogout} className="hidden xl:inline-flex btn-secondary !px-4 !py-2 text-sm">
              <LogOut size={15} /> Logout
            </button>
          ) : (
            <Link to="/login" className="hidden xl:inline-flex btn-primary !px-4 !py-2 text-sm">
              Sign In
            </Link>
          )}
          <button className="xl:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-black/5 dark:border-white/5 xl:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-5">
              <NavLink to="/explore" onClick={() => setOpen(false)} className={linkClass}>Explore</NavLink>
              <NavLink to="/leaderboard" onClick={() => setOpen(false)} className={linkClass}>Leaderboard</NavLink>
              {user && (
                <>
                  <NavLink to="/dashboard" onClick={() => setOpen(false)} className={linkClass}>Dashboard</NavLink>
                  <NavLink to="/requests" onClick={() => setOpen(false)} className={linkClass}>Requests</NavLink>
                  <NavLink to="/chat" onClick={() => setOpen(false)} className={linkClass}>Chat</NavLink>
                  <NavLink to="/schedule" onClick={() => setOpen(false)} className={linkClass}>Schedule</NavLink>
                  <NavLink to="/certificates" onClick={() => setOpen(false)} className={linkClass}>Certificates</NavLink>
                  <NavLink to="/profile" onClick={() => setOpen(false)} className={linkClass}>Profile</NavLink>
                  {user.role === "admin" && (
                    <NavLink to="/admin" onClick={() => setOpen(false)} className={linkClass}>Admin</NavLink>
                  )}
                </>
              )}
              {user ? (
                <button onClick={handleLogout} className="btn-secondary w-full">Logout</button>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="btn-primary w-full">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
