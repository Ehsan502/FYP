import { Award } from "lucide-react";

const BADGE_LABELS = {
  first_swap: "First Swap",
  swap_regular: "Swap Regular",
  swap_veteran: "Swap Veteran",
  swap_legend: "Swap Legend",
  top_rated: "Top Rated",
  helpful_teacher: "Helpful Teacher",
};

const BadgeChip = ({ badgeKey }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
    <Award size={12} /> {BADGE_LABELS[badgeKey] || badgeKey.replace(/_/g, " ")}
  </span>
);

export default BadgeChip;
