import { formatPrice } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { useCatalog } from "@/lib/catalog";

export function Totals({ checkout = false }: { checkout?: boolean }) {
  const cart = useStore();
  const lines = checkout ? cart.checkoutLines : cart.lines;
  const subtotal = checkout ? cart.checkoutSubtotal : cart.subtotal;
  const delivery = checkout ? cart.checkoutDelivery : cart.delivery;
  const total = checkout ? cart.checkoutTotal : cart.total;
  const { settings } = useCatalog();
  const provisional = lines.some((l) => l.product.requestOnly) || !settings.deliveryConfigured;
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between"><dt className="text-muted-foreground">{provisional ? "Estimated product subtotal" : "Subtotal"}</dt><dd>{formatPrice(subtotal)}</dd></div>
      <div className="flex justify-between"><dt className="text-muted-foreground">Delivery (Pakistan)</dt><dd>{!settings.deliveryConfigured ? "To be confirmed" : delivery === 0 ? "Free" : formatPrice(delivery)}</dd></div>
      <div className="flex justify-between border-t border-border pt-3 text-base font-bold"><dt>{provisional ? (settings.deliveryConfigured ? "Estimated total" : "Estimated products only") : "Total"}</dt><dd>{formatPrice(settings.deliveryConfigured ? total : subtotal)}</dd></div>
    </dl>
  );
}
