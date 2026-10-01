import { cn } from "@/lib/utils";
import { formatPrice } from "@/data/catalog";

export function PriceDisplay({
  price,
  from,
  className,
  size = "md",
}: {
  price: number;
  from?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  } as const;

  return (
    <p className={cn("tabular-nums font-medium tracking-tight", sizes[size], className)}>
      {from && <span className="mr-1 text-xs font-normal text-muted-foreground">from</span>}
      <span className="break-words">{formatPrice(price)}</span>
    </p>
  );
}
