import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, ShoppingCart, Trash2 } from "lucide-react";
import { CONTACT, formatPrice } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { Totals } from "@/components/shop/OrderSummary";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — SweeTrade" },
      { name: "description", content: "Review your SweeTrade order before checkout or order directly on WhatsApp." },
      { property: "og:title", content: "Your Cart — SweeTrade" },
      { property: "og:description", content: "Review your order." },
    ],
  }),
  component: Cart,
});

function Cart() {
  const { lines, count, setQty, remove, clear, total } = useStore();

  const waText = encodeURIComponent(
    `Assalam o Alaikum, I'd like to order:\n${lines.map((l) => `• ${l.product.name} (${l.variant}) × ${l.qty} = ${formatPrice(l.total)}`).join("\n")}\nTotal: ${formatPrice(total)}`,
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
    <div className="container-page py-8 lg:py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl">Your Cart ({count})</h1>
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-primary"><ArrowLeft className="size-4" /> Continue Shopping</Link>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {lines.map((l) => (
              <li key={l.productId + l.variant} className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[80px_minmax(0,1fr)_auto_auto_auto] sm:items-center">
                <img src={l.product.image} alt={l.product.name} className="size-18 rounded-md object-cover sm:size-20" loading="lazy" />
                <div className="min-w-0">
                  <Link to="/product/$slug" params={{ slug: l.product.slug }} className="font-semibold hover:text-primary">{l.product.name}</Link>
                  <p className="text-sm text-muted-foreground">{l.variant} · {formatPrice(l.v.price)}</p>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-3 sm:justify-end">
                  <QuantitySelector compact value={l.qty} onChange={(n) => setQty(l.productId, l.variant, n)} />
                  <p className="w-24 text-right font-semibold">{formatPrice(l.total)}</p>
                  <button className="tap-target text-muted-foreground hover:text-destructive" aria-label={`Remove ${l.product.name}`} onClick={() => remove(l.productId, l.variant)}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={clear} className="mt-4 text-sm text-primary hover:underline">Clear Cart</button>
        </div>
        <aside className="h-fit rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-xl">Order Summary</h2>
          <Totals />
          <Button asChild size="lg" block className="mt-5"><Link to="/checkout">Proceed to Checkout</Link></Button>
          <Button asChild size="lg" variant="outline" block className="mt-3 border-success text-success hover:bg-success/10">
            <a href={`https://wa.me/${CONTACT.whatsapp}?text=${waText}`} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp Order</a>
          </Button>
        </aside>
      </div>
    </div>
  );
}
