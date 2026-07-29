import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative flex h-9 w-16 items-center rounded-full border border-ink-light/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-1 transition-colors"
    >
      <motion.div
        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-glow"
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? <Moon size={14} className="text-base-dark" /> : <Sun size={14} className="text-base-dark" />}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
