import { Minus, Plus } from "lucide-react";

export function QuantitySelector({
  value,
  onChange,
  label = "Quantity",
  max = 99,
  compact = false,
}: {
  value: number;
  onChange: (next: number) => void;
  label?: string;
  max?: number;
  compact?: boolean;
}) {
  const btn =
    "tap-target shrink-0 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground";

  return (
    <div
      className={`inline-flex items-center rounded-sm border border-input h-11`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={`${btn} h-11 w-11`}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </button>
      <span
        className="min-w-8 text-center text-sm tabular-nums"
        aria-live="polite"
        aria-label={`${label}: ${value}`}
      >
        {value}
      </span>
      <button
        type="button"
        className={`${btn} ${compact ? "h-9 w-9 min-h-0 min-w-0" : ""}`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
