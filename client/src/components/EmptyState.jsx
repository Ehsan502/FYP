import { motion } from "framer-motion";

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="card flex flex-col items-center gap-3 py-16 px-6 text-center"
  >
    {Icon && (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon size={26} />
      </div>
    )}
    <h3 className="font-display text-lg font-semibold">{title}</h3>
    {description && <p className="max-w-sm text-sm text-muted-light dark:text-muted-dark">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </motion.div>
);

export default EmptyState;
