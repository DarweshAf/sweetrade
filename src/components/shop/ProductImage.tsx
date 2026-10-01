import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Fixed-ratio image frame: reserves space before load (no layout shift) and
 * degrades to a labelled placeholder if the file fails.
 */
export function ProductImage({
  src,
  alt,
  ratio = "4/5",
  className,
  imgClassName,
  priority = false,
  zoom = false,
  sizes,
}: {
  src: string;
  alt: string;
  ratio?: "4/5" | "1/1" | "3/2" | "16/9";
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  zoom?: boolean;
  sizes?: string;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const ratioClass = {
    "4/5": "aspect-4/5",
    "1/1": "aspect-square",
    "3/2": "aspect-3/2",
    "16/9": "aspect-video",
  }[ratio];

  return (
    <div className={cn("img-frame", ratioClass, className)}>
      {status !== "error" ? (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-500",
            status === "ready" ? "opacity-100" : "opacity-0",
            zoom && "hover-zoom",
            imgClassName,
          )}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted px-3 text-center">
          <ImageOff className="size-5 text-muted-foreground" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">Image unavailable</span>
        </div>
      )}
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
      )}
    </div>
  );
}
