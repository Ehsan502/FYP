import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

const NotFound = () => (
  <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-6 text-center">
    <motion.h1
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="font-display text-8xl font-bold text-primary/20"
    >
      404
    </motion.h1>
    <p className="mt-4 text-lg font-medium">This page took a different path.</p>
    <p className="mt-1 text-muted-light dark:text-muted-dark">Let's get you back on track.</p>
    <Link to="/" className="btn-primary mt-8">
      <Home size={17} /> Back to Home
    </Link>
  </div>
);

export default NotFound;
