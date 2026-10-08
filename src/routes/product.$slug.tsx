import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Heart, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { categoryOf, CONTACT, findProduct, formatPrice, products } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { ProductImage } from "@/components/shop/ProductImage";
import { ProductCard } from "@/components/shop/ProductCard";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = findProduct(params.slug);
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
});

const TABS = ["Description", "Ingredients", "Storage", "Delivery"] as const;

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const { add, wishlist, toggleWish } = useStore();
  const navigate = useNavigate();
  const [img, setImg] = useState(0);
  const [variant, setVariant] = useState(p.variants[0]!.label);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");
  const v = p.variants.find((x) => x.label === variant)!;
  const cat = categoryOf(p.category);
  const wished = wishlist.includes(p.id);
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);

  const addIt = () => {
    add(p.id, v.label, qty);
    toast.success(`${p.name} (${v.label}) × ${qty} added to cart`);
  };

  const tabBody: Record<(typeof TABS)[number], string> = {
    Description: p.description,
    Ingredients: p.ingredients,
    Storage: p.storage,
    Delivery: `Delivery across Karachi within 1–3 working days. Free delivery on orders above ${formatPrice(CONTACT.freeDeliveryThreshold)}; otherwise ${formatPrice(CONTACT.deliveryFee)}. Cash on Delivery available.`,
  };

  return (
    <div className="container-page py-6 pb-28 lg:py-10 lg:pb-10">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link><ChevronRight className="size-3" />
        <Link to="/shop" search={{ category: p.category }} className="hover:text-primary">{cat?.name}</Link><ChevronRight className="size-3" />
        <span className="text-foreground">{p.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="relative overflow-hidden rounded-lg border border-border">
            <ProductImage src={p.gallery[img] ?? p.image} alt={p.name} ratio="1/1" priority />
            <button onClick={() => toggleWish(p.id)} aria-pressed={wished} aria-label="Toggle wishlist" className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-card shadow-card">
              <Heart className={`size-5 ${wished ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>
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
          <p className="mt-3 text-2xl font-bold text-primary">{formatPrice(v.price)}</p>
          <p className="mt-3 text-muted-foreground">{p.short}</p>

          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-semibold">Size / Weight</legend>
            <div className="flex flex-wrap gap-3">
              {p.variants.map((x) => (
                <button
                  key={x.label}
                  onClick={() => setVariant(x.label)}
                  aria-pressed={variant === x.label}
                  className={`min-w-24 rounded-md border px-4 py-2 text-center transition-colors ${variant === x.label ? "border-primary bg-primary-soft" : "border-input hover:border-border-strong"}`}
                >
                  <span className="block text-sm font-semibold">{x.label}</span>
                  <span className="block text-xs text-muted-foreground">{formatPrice(x.price)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <p className={`mt-4 text-sm font-medium ${p.inStock ? "text-success" : "text-destructive"}`}>{p.inStock ? "In stock" : "Currently out of stock"}</p>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold">Quantity</p>
            <QuantitySelector value={qty} onChange={(n) => setQty(Math.max(1, n))} />
          </div>

          <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-2">
            <Button size="lg" disabled={!p.inStock} onClick={addIt}>Add to Cart</Button>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary-soft" disabled={!p.inStock} onClick={() => { addIt(); navigate({ to: "/checkout" }); }}>Buy Now</Button>
          </div>

          <ul className="mt-7 grid grid-cols-1 gap-4 border-y border-border py-5 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2.5"><Truck className="size-6 text-primary" strokeWidth={1.5} /><span className="leading-tight"><b className="block font-medium">Karachi Delivery</b><span className="text-muted-foreground">Fast and reliable</span></span></li>
            <li className="flex items-center gap-2.5"><ShieldCheck className="size-6 text-primary" strokeWidth={1.5} /><span className="leading-tight"><b className="block font-medium">Cash on Delivery</b><span className="text-muted-foreground">Available</span></span></li>
            <li className="flex items-center gap-2.5"><MessageCircle className="size-6 text-success" strokeWidth={1.5} /><span className="leading-tight"><b className="block font-medium">WhatsApp Support</b><span className="text-muted-foreground">{CONTACT.phone}</span></span></li>
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
            {related.map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-3 border-t border-border bg-background p-3 sm:hidden">
        <Button disabled={!p.inStock} onClick={addIt}>Add to Cart</Button>
        <Button variant="outline" className="border-primary text-primary" disabled={!p.inStock} onClick={() => { addIt(); navigate({ to: "/checkout" }); }}>Buy Now</Button>
      </div>
    </div>
  );
}
