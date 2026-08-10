import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  count,
  size = "sm",
  className,
}: {
  value: number | string;
  count?: number | null;
  size?: "sm" | "md";
  className?: string;
}) {
  const rating = Number(value) || 0;
  const px = size === "md" ? "size-4" : "size-3.5";
  return (
    <span className={cn("flex items-center gap-1", className)}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              px,
              i <= Math.round(rating)
                ? "fill-secondary text-secondary"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        ))}
      </span>
      <span className="text-xs text-muted-foreground">
        {rating > 0 ? rating.toFixed(1) : "New"}
        {typeof count === "number" && count > 0 ? ` (${count})` : ""}
      </span>
      <span className="sr-only">{rating > 0 ? `Rated ${rating} out of 5` : "Not yet rated"}</span>
    </span>
  );
}
