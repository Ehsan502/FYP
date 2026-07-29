import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, MessageSquare, Repeat2, Star, Award, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "../context/NotificationContext.jsx";

const ICONS = {
  swap_request: Repeat2,
  swap_accepted: Repeat2,
  swap_rejected: Repeat2,
  swap_completed: Repeat2,
  message: MessageSquare,
  review: Star,
  session_scheduled: Calendar,
  session_reminder: Calendar,
  badge_earned: Award,
  system: Bell,
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-ink-light dark:text-ink-dark hover:text-primary transition-colors"
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-base-dark">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-3 w-80 card max-h-[26rem] overflow-y-auto p-2"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <p className="font-display text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-light dark:text-muted-dark">
                No notifications yet.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {notifications.slice(0, 15).map((n) => {
                  const Icon = ICONS[n.type] || Bell;
                  return (
                    <Link
                      key={n._id}
                      to={n.link || "#"}
                      onClick={() => {
                        if (!n.isRead) markAsRead(n._id);
                        setOpen(false);
                      }}
                      className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                        !n.isRead ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="leading-snug">{n.text}</p>
                        <p className="mt-0.5 text-xs text-muted-light dark:text-muted-dark">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
