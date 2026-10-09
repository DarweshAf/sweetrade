import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, ShoppingCart, Trash2 } from "lucide-react";
import { formatPrice } from "@/data/catalog";
import { useCatalog } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { Totals } from "@/components/shop/OrderSummary";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex,follow,noarchive" },
      { title: "Your Cart — SweeTrade" },
      { name: "description", content: "Review your SweeTrade order before checkout or order directly on WhatsApp." },
      { property: "og:title", content: "Your Cart — SweeTrade" },
      { property: "og:description", content: "Review your order." },
    ],
  }),
  component: Cart,
});

function Cart() {
  const { contact: CONTACT } = useCatalog();
  const { lines, count, setQty, remove, clear, clearBuyNow, subtotal, total } = useStore();
  const requestMode = !CONTACT.deliveryConfigured || lines.some((line) => line.product.requestOnly);

  const waText = encodeURIComponent(
    `Assalam o Alaikum, I'd like to place an order request:\n${lines.map((l) => `• ${l.product.name} (${l.variant}) × ${l.qty} = ${formatPrice(l.total)}`).join("\n")}\n${requestMode ? "Estimated product subtotal" : "Total"}: ${formatPrice(requestMode ? subtotal : total)}${CONTACT.deliveryConfigured ? "" : "\nDelivery: To be confirmed"}${requestMode ? "\nPlease confirm prices and shipping before fulfillment." : ""}`,
  );

  if (!lines.length) {
    return (
      <div className="container-page py-24 text-center">
        <ShoppingCart className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-4 text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Browse our natural products and add your favourites.</p>
        <Button asChild size="lg" className="mt-6"><Link to="/shop">Start Shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="container-page py-7 sm:py-10">
      <div className="mb-7 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Your selection</p>
          <h1 className="mt-2 text-[clamp(1.8rem,5vw,2.75rem)]">Shopping Cart <span className="font-sans text-base font-medium text-muted-foreground">({count})</span></h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Review your sizes and quantities before sending your order request.</p>
        </div>
        <Link to="/shop" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> Continue shopping
        </Link>
      </div>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
            {lines.map((l) => (
              <li key={l.productId + l.variant} className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-center gap-3 p-3 sm:grid-cols-[84px_minmax(0,1fr)] sm:gap-4 sm:p-5 xl:grid-cols-[84px_minmax(0,1fr)_auto]">
                <img src={l.product.image} alt={l.product.name} className="size-[72px] rounded-lg object-cover sm:size-[84px]" loading="lazy" />
                <div className="min-w-0">
                  <Link to="/product/$slug" params={{ slug: l.product.slug }} className="font-semibold hover:text-primary">{l.product.name}</Link>
                  <p className="text-sm text-muted-foreground">{l.variant} · {formatPrice(l.v.price)}</p>
                </div>
                <div className="col-span-2 flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-border pt-3 sm:gap-3 xl:col-span-1 xl:justify-end xl:border-0 xl:pt-0">
                  <QuantitySelector compact value={l.qty} onChange={(n) => setQty(l.productId, l.variant, n)} />
                  <p className="min-w-0 text-right text-sm font-semibold tabular-nums sm:text-base">{formatPrice(l.total)}</p>
                  <button className="tap-target text-muted-foreground hover:text-destructive" aria-label={`Remove ${l.product.name}`} onClick={() => remove(l.productId, l.variant)}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" onClick={clear} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline">Clear cart</button>
        </div>
        <aside className="h-fit rounded-xl border border-border bg-card p-4 shadow-card sm:p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-xl">Order Summary</h2>
          <Totals />
          {requestMode && <p className="mt-3 text-xs text-muted-foreground">Prices are estimates. Submit a request without paying upfront; SweeTrade will confirm costs and delivery.</p>}
          <Button asChild size="lg" block className="mt-5"><Link to="/checkout" onClick={clearBuyNow}>{requestMode ? "Continue to Order Request" : "Proceed to Checkout"}</Link></Button>
          {CONTACT.whatsapp && <Button asChild size="lg" variant="outline" block className="mt-3 border-success text-success hover:bg-success/10">
            <a href={`https://wa.me/${CONTACT.whatsapp}?text=${waText}`} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp Order</a>
          </Button>}
        </aside>
      </div>
    </div>
  );
}
