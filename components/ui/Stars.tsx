import { Star } from "lucide-react";

/** One numeric rating rendered as exactly five stars, with a single accessible label. */
export function Stars({ rating, label, size = "md" }: { rating: number; label: string; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  return (
    <span role="img" aria-label={label} className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={`${cls} ${i < Math.round(rating) ? "fill-gold-bright text-gold-bright" : "text-faint"}`}
        />
      ))}
    </span>
  );
}
