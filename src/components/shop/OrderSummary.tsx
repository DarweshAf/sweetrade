import { formatPrice } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { useCatalog } from "@/lib/catalog";

export function Totals() {
  const { subtotal, delivery, total } = useStore();
  const { settings } = useCatalog();
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
      <div className="flex justify-between"><dt className="text-muted-foreground">Delivery (Pakistan)</dt><dd>{!settings.deliveryConfigured ? "To be confirmed" : delivery === 0 ? "Free" : formatPrice(delivery)}</dd></div>
      <div className="flex justify-between border-t border-border pt-3 text-base font-bold"><dt>{settings.deliveryConfigured ? "Total" : "Products subtotal"}</dt><dd>{formatPrice(settings.deliveryConfigured ? total : subtotal)}</dd></div>
    </dl>
  );
}
