import { formatPrice } from "@/data/catalog";
import { useStore } from "@/lib/store";

export function Totals() {
  const { subtotal, delivery, total } = useStore();
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
      <div className="flex justify-between"><dt className="text-muted-foreground">Delivery (Karachi)</dt><dd>{delivery === 0 ? "Free" : formatPrice(delivery)}</dd></div>
      <div className="flex justify-between border-t border-border pt-3 text-base font-bold"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
    </dl>
  );
}
