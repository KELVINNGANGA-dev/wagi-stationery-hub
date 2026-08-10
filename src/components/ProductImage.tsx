import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Product image with lazy loading, a shimmer placeholder and a graceful
 * fallback for products whose real photo has not been uploaded yet.
 */
export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const hasImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {hasImage ? (
        <>
          {!loaded && <div className="absolute inset-0 skeleton-shimmer" />}
          <img
            src={src ?? ""}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn(
              "size-full object-contain transition-opacity duration-500",
              loaded ? "opacity-100" : "opacity-0",
              imgClassName,
            )}
          />
        </>
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1.5 px-3 text-center">
          <ImageOff className="size-6 text-muted-foreground/60" aria-hidden />
          <span className="text-[0.65rem] font-medium leading-tight text-muted-foreground">
            Photo coming soon
          </span>
        </div>
      )}
    </div>
  );
}
