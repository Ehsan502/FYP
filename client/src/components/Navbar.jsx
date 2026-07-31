import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, LogOut, LayoutDashboard, Compass, 
  User as UserIcon, MessageSquare, Trophy, ShieldCheck, 
  CalendarClock, Award, Settings 
} from "lucide-react";
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
    setOpen(false);
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-primary font-semibold" : "text-ink-light/70 dark:text-ink-dark/70 hover:text-primary"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive 
        ? "bg-primary/10 text-primary font-semibold border border-primary/20" 
        : "text-ink-light/80 dark:text-ink-dark/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-primary"
    }`;

  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <Logo />
          SkillSwap
        </Link>

        {/* Desktop Navigation Links */}
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
                  <span className="inline-flex items-center gap-1.5 text-purple-500 dark:text-purple-400 font-bold">
                    <ShieldCheck size={16} /> Admin
                  </span>
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* Actions & Hamburger Toggle */}
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

          {/* Mobile Menu Button */}
          <button className="xl:hidden text-ink-light dark:text-ink-dark p-1" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-black/5 dark:border-white/5 xl:hidden bg-background/95 backdrop-blur-lg"
          >
            <div className="flex flex-col gap-2 px-6 py-5">
              
              {/* Logged In User Mobile Header Card */}
              {user && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/20 text-primary">
                      <UserIcon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink-light dark:text-ink-dark leading-tight">{user.name}</p>
                      <p className="text-[11px] text-ink-light/60 dark:text-ink-dark/60">{user.email}</p>
                    </div>
                  </div>
                  {user.role === "admin" && (
                    <span className="bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[10px] px-2 py-0.5 rounded-md font-bold border border-purple-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
              )}

              {/* Mobile Navigation List */}
              <NavLink to="/explore" onClick={() => setOpen(false)} className={mobileLinkClass}>
                <Compass size={18} className="text-primary" /> Explore
              </NavLink>

              <NavLink to="/leaderboard" onClick={() => setOpen(false)} className={mobileLinkClass}>
                <Trophy size={18} className="text-primary" /> Leaderboard
              </NavLink>

              {user && (
                <>
                  <NavLink to="/dashboard" onClick={() => setOpen(false)} className={mobileLinkClass}>
                    <LayoutDashboard size={18} className="text-primary" /> Dashboard
                  </NavLink>

                  <NavLink to="/requests" onClick={() => setOpen(false)} className={mobileLinkClass}>
                    <MessageSquare size={18} className="text-primary" /> Requests
                  </NavLink>

                  <NavLink to="/chat" onClick={() => setOpen(false)} className={mobileLinkClass}>
                    <MessageSquare size={18} className="text-primary" /> Chat
                  </NavLink>

                  <NavLink to="/schedule" onClick={() => setOpen(false)} className={mobileLinkClass}>
                    <CalendarClock size={18} className="text-primary" /> Schedule
                  </NavLink>

                  <NavLink to="/certificates" onClick={() => setOpen(false)} className={mobileLinkClass}>
                    <Award size={18} className="text-primary" /> Certificates
                  </NavLink>

                  <NavLink to="/profile" onClick={() => setOpen(false)} className={mobileLinkClass}>
                    <Settings size={18} className="text-primary" /> Profile & Settings
                  </NavLink>

                  {user.role === "admin" && (
                    <NavLink to="/admin" onClick={() => setOpen(false)} className={mobileLinkClass}>
                      <ShieldCheck size={18} className="text-purple-500" /> Admin Panel
                    </NavLink>
                  )}
                </>
              )}

              {/* Action Buttons Mobile */}
              <div className="pt-3 mt-2 border-t border-black/5 dark:border-white/5">
                {user ? (
                  <button onClick={handleLogout} className="btn-secondary w-full flex items-center justify-center gap-2">
                    <LogOut size={16} /> Logout
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-primary w-full text-center">
                    Sign In
                  </Link>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;