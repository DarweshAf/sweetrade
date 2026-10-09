import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Heart, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/data/catalog";
import { catalogQuery, useCatalog } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { ProductImage } from "@/components/shop/ProductImage";
import { ProductCard } from "@/components/shop/ProductCard";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { StoreSkeleton } from "@/components/site/StoreSkeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params, context }) => {
    const cat = await context.queryClient.ensureQueryData(catalogQuery);
    const product = cat.products.find((x) => x.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Product not found — SweeTrade" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — SweeTrade` },
        { name: "description", content: p.short },
        { property: "og:title", content: `${p.name} — SweeTrade` },
        { property: "og:description", content: p.short },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl">Product not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-primary">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
  pendingComponent: StoreSkeleton,
});

const TABS = ["Description", "Ingredients", "Storage", "Delivery"] as const;

function ProductPage() {
  const { categoryOf, contact: CONTACT, products } = useCatalog();
  const { product: p } = Route.useLoaderData();
  const { add, startBuyNow, wishlist, toggleWish } = useStore();
  const navigate = useNavigate();
  const [img, setImg] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [variant, setVariant] = useState(p.variants[0]?.label ?? "Contact for price");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");
  const v = p.variants.find((x) => x.label === variant) ?? p.variants[0] ?? { label: "Contact for price", price: 0 };
  const cat = categoryOf(p.category);
  const wished = wishlist.includes(p.id);
  const purchasable = Boolean(p.inStock && (p.priceVerified || p.requestOnly) && v.price > 0);
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);

  const addIt = () => {
    if (!purchasable) return;
    add(p.id, v.label, qty);
    toast.success(`${p.name} (${v.label}) × ${qty} added to cart`, {
      action: { label: "View Cart", onClick: () => navigate({ to: "/cart" }) },
    });
  };
  const buyIt = () => {
    if (!purchasable) return;
    startBuyNow(p.id, v.label, qty);
    navigate({ to: "/checkout" });
  };

  const tabBody: Record<(typeof TABS)[number], string> = {
    Description: p.description,
    Ingredients: p.ingredients || "Contact SweeTrade to confirm the ingredients for this product.",
    Storage: p.storage || "Contact SweeTrade for confirmed storage instructions.",
    Delivery: CONTACT.deliveryConfigured && CONTACT.freeDeliveryThreshold > 0 ? `Pakistan shipping: free above ${formatPrice(CONTACT.freeDeliveryThreshold)}, otherwise ${formatPrice(CONTACT.deliveryFee)} under current store-wide settings. Contact us to confirm service and delivery timing to your city.` : "Shipping charges and delivery timing for your city must be confirmed by SweeTrade.",
  };

  return (
    <div className="container-page py-6 pb-48 lg:py-10 lg:pb-10">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link><ChevronRight className="size-3" />
        <Link to="/shop" search={{ category: p.category }} className="hover:text-primary">{cat?.name}</Link><ChevronRight className="size-3" />
        <span className="text-foreground">{p.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="relative overflow-hidden rounded-lg border border-border">
            <button type="button" className="block w-full" onClick={() => setZoomOpen(true)} aria-label={`Enlarge ${p.name} image`}><ProductImage src={p.gallery[img] ?? p.image} alt={p.imageIllustrative ? `Illustrative category photo for ${p.name}` : p.name} ratio="1/1" priority /></button>
            <button onClick={() => toggleWish(p.id)} aria-pressed={wished} aria-label="Toggle wishlist" className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-card shadow-card">
              <Heart className={`size-5 ${wished ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>
          <Dialog open={zoomOpen} onOpenChange={setZoomOpen}><DialogContent className="max-w-3xl"><DialogTitle className="sr-only">{p.name} image</DialogTitle><img src={p.gallery[img] ?? p.image} alt={p.name} className="max-h-[78vh] w-full object-contain" /></DialogContent></Dialog>
          {p.imageIllustrative && <p className="mt-2 text-sm text-muted-foreground">Illustrative category image. The product photograph will be added by SweeTrade.</p>}
          <div className="mt-3 grid grid-cols-4 gap-3">
            {p.gallery.map((g, i) => (
              <button key={i} onClick={() => setImg(i)} aria-label={`View image ${i + 1}`} className={`overflow-hidden rounded-md border-2 ${i === img ? "border-primary" : "border-transparent"}`}>
                <ProductImage src={g} alt="" ratio="1/1" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl">{p.name}</h1>
          <div className="mt-3" aria-live="polite" aria-atomic="true">
            <p key={v.label} className="wow-price-pop text-2xl font-bold text-primary">
              {v.price > 0 ? formatPrice(v.price) : "Price on request"}
            </p>
            {!p.priceVerified && v.price > 0 && (
              <p className="mt-1 text-sm font-semibold text-destructive">
                Estimated price only — not final. You can submit an order request; SweeTrade will confirm pricing and shipping by phone before fulfillment.
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">Selected size: {v.label}</p>
          </div>
          <p className="mt-3 text-muted-foreground">{p.short}</p>

          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-semibold">Size / Weight</legend>
            <div className="flex flex-wrap gap-3" role="group" aria-label="Available sizes and prices">
              {p.variants.map((x) => (
                <button
                  key={x.label}
                  type="button"
                  onClick={() => setVariant(x.label)}
                  aria-pressed={v.label === x.label}
                  className={`min-w-24 rounded-md border px-4 py-2 text-center transition-colors ${v.label === x.label ? "border-primary bg-primary-soft" : "border-input hover:border-border-strong"}`}
                >
                  <span className="block text-sm font-semibold">{x.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {x.price > 0 ? `${!p.priceVerified ? "Est. " : ""}${formatPrice(x.price)}` : "Ask for price"}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <p className={`mt-4 text-sm font-medium ${p.inStock ? "text-success" : "text-destructive"}`}>{p.requestOnly ? "Order request available — stock and final price to be confirmed" : p.inStock && v.price > 0 ? "In stock" : "Contact us for availability"}</p>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold">Quantity</p>
            <QuantitySelector value={qty} onChange={(n) => setQty(Math.max(1, n))} />
          </div>

          <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-2">
            {purchasable ? (
              <>
                <Button size="lg" onClick={addIt}>Add to Cart</Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary-soft" onClick={buyIt}>Buy Now</Button>
              </>
            ) : (
              <>
                <Button asChild size="lg"><Link to="/contact">Enquire About Product</Link></Button>
                <Button asChild size="lg" variant="outline"><a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>Call SweeTrade</a></Button>
              </>
            )}
          </div>

          <ul className="mt-7 grid grid-cols-1 gap-4 border-y border-border py-5 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2.5"><Truck className="size-6 text-primary" strokeWidth={1.5} /><span className="leading-tight"><b className="block font-medium">Pakistan-wide Delivery</b><span className="text-muted-foreground">Confirm delivery time</span></span></li>
            <li className="flex items-center gap-2.5"><ShieldCheck className="size-6 text-primary" strokeWidth={1.5} /><span className="leading-tight"><b className="block font-medium">Payment Options</b><span className="text-muted-foreground">Shown at checkout</span></span></li>
            <li className="flex items-center gap-2.5"><MessageCircle className="size-6 text-success" strokeWidth={1.5} /><span className="leading-tight"><b className="block font-medium">Customer Support</b><span className="text-muted-foreground">{CONTACT.phone}</span></span></li>
          </ul>

          <div className="mt-6">
            <div role="tablist" className="no-scrollbar flex gap-6 overflow-x-auto border-b border-border">
              {TABS.map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`-mb-px shrink-0 border-b-2 py-3 text-sm font-medium ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
              ))}
            </div>
            <p role="tabpanel" className="py-4 text-sm leading-relaxed text-muted-foreground">{tabBody[tab]}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-2xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {related.map((r, i) => <ScrollReveal key={r.id} className="h-full" delay={i * 40}><ProductCard product={r} /></ScrollReveal>)}
          </div>
        </section>
      )}

      <div className="wow-mobile-bar fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 space-y-2 border-t border-border bg-background/98 px-3 py-2 shadow-raised backdrop-blur sm:hidden">
        <div className="flex min-w-0 items-center justify-between gap-3" aria-live="polite">
          <span className="truncate text-sm font-medium text-muted-foreground">Selected: {v.label}{qty > 1 ? ` × ${qty}` : ""}</span>
          <span key={v.label} className="wow-price-pop shrink-0 text-base font-bold tabular-nums text-primary">
            {v.price > 0 ? formatPrice(v.price * qty) : "Price on request"}
            {!p.priceVerified && <span className="ml-1 text-[10px] font-normal text-muted-foreground">est.</span>}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {purchasable ? (
            <>
              <Button type="button" variant="outline" className="wow-buy-button min-h-11 min-w-0 border-primary text-primary" onClick={addIt}>Add to Cart</Button>
              <Button type="button" className="wow-buy-button min-h-11 min-w-0" onClick={buyIt}>Buy Now</Button>
            </>
          ) : (
            <>
              <Button asChild><Link to="/contact">Enquire</Link></Button>
              <Button asChild variant="outline"><a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>Call Us</a></Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
