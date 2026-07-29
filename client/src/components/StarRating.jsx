import { useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({ value = 0, onChange, size = 22, readOnly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(n)}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={readOnly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
          >
            <Star size={size} className={filled ? "fill-accent text-accent" : "text-muted-light dark:text-muted-dark"} />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
