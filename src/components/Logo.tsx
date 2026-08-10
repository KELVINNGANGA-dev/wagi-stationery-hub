import { cn } from "@/lib/utils";
import { STORE } from "@/lib/store-config";

/** WAGI - STATIONARIES "WS" monogram logo. */
export function Logo({
  className,
  size = "md",
  showWordmark = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}) {
  const box =
    size === "sm" ? "size-8 text-sm" : size === "lg" ? "size-14 text-xl" : "size-10 text-base";

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className={cn(
          "brand-gradient grid place-items-center rounded-xl font-extrabold tracking-tight text-primary-foreground shadow-brand",
          box,
        )}
      >
        {STORE.initials}
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-extrabold tracking-tight",
              size === "lg" ? "text-xl" : "text-[0.95rem]",
            )}
          >
            WAGI
          </span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Stationaries
          </span>
        </span>
      )}
    </span>
  );
}
