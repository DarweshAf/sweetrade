import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X, SearchX } from "lucide-react";
import { formatPrice, priceFrom } from "@/data/catalog";
import { useCatalog } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/ProductCard";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { StoreSkeleton } from "@/components/site/StoreSkeleton";
import { Button } from "@/components/ui/button";

type Search = { category?: string | undefined; q?: string | undefined; sort?: string | undefined; stock?: string | undefined; max?: number | undefined };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: { category?: unknown; q?: unknown; sort?: unknown; stock?: unknown; max?: unknown }): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
    stock: typeof s.stock === "string" ? s.stock : undefined,
    max: s.max ? Number(s.max) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All Products — SweeTrade" },
      { name: "description", content: "Browse honey, shilajit, saffron, olive oil, dates, sweets and pickles. Filter by category, price and availability." },
      { property: "og:title", content: "Shop All Products — SweeTrade" },
      { property: "og:description", content: "Discover natural products for customers across Pakistan." },
    ],
  }),
  component: Shop,
  pendingComponent: StoreSkeleton,
});


function Shop() {
  const { categories: CATEGORIES, countIn, products } = useCatalog();
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<Search>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  const MIN = 0;
  const MAX = Math.max(1000, ...products.flatMap((p) => p.variants.map((v) => v.price)));
  const max = s.max === undefined || !Number.isFinite(s.max) ? MAX : Math.max(MIN, Math.min(MAX, s.max));

  const list = useMemo(() => {
    let r = products.filter((p) => {
      if (s.category && p.category !== s.category) return false;
      if (s.stock === "in" && !p.inStock) return false;
      if (s.stock === "out" && p.inStock) return false;
      if (p.variants.length > 0 && priceFrom(p) > max) return false;
      if (s.q && !`${p.name} ${p.category}`.toLowerCase().includes(s.q.toLowerCase())) return false;
      return true;
    });
    if (s.sort === "low") r = [...r].sort((a, b) => priceFrom(a) - priceFrom(b));
    if (s.sort === "high") r = [...r].sort((a, b) => priceFrom(b) - priceFrom(a));
    if (s.sort === "name") r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    return r;
  }, [products, s.category, s.stock, s.q, s.sort, max]);

  const active = Boolean(s.category || s.stock || s.q || s.max);
  const cat = CATEGORIES.find((c) => c.slug === s.category);

  const radio = "size-4 accent-primary";
  const Filters = (
    <div className="space-y-7">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Categories</legend>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 text-sm"><input type="radio" className={radio} checked={!s.category} onChange={() => set({ category: undefined })} /> All products ({products.length})</label>
          {CATEGORIES.map((c) => (
            <label key={c.slug} className="flex items-center gap-2.5 text-sm">
              <input type="radio" className={radio} checked={s.category === c.slug} onChange={() => set({ category: c.slug })} />
              {c.name} <span className="text-muted-foreground">({countIn(c.slug)})</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Price Range</legend>
        <input type="range" min={MIN} max={MAX} step={100} value={max} onChange={(e) => set({ max: Number(e.target.value) === MAX ? undefined : Number(e.target.value) })} className="w-full accent-primary" aria-label="Maximum price" />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>{formatPrice(MIN)}</span><span>{formatPrice(max)}</span></div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Availability</legend>
        <div className="space-y-2.5">
          {[["in", "Available to order / request", products.filter((p) => p.inStock).length], ["out", "Currently unavailable", products.filter((p) => !p.inStock).length]].map(([v, l, n]) => (
            <label key={v} className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" className={radio} checked={s.stock === v} onChange={(e) => set({ stock: e.target.checked ? (v as string) : undefined })} />
              {l} <span className="text-muted-foreground">({n})</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Button block onClick={() => navigate({ search: {} })} disabled={!active}>Clear Filters</Button>
    </div>
  );

  return (
    <div className="container-page py-7 sm:py-10">
      <header className="mb-7 max-w-2xl sm:mb-9">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">The SweeTrade Collection</p>
        <h1 className="mt-2 text-[clamp(1.8rem,5vw,2.75rem)] leading-tight">
          {s.q ? "Search results" : cat?.name ?? "Shop All Products"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          {s.q ? `Showing products matching “${s.q}”.` :
            cat ? `Explore ${cat.name.toLowerCase()} and choose a suitable pack size.` :
            "Explore honey, saffron, shilajit, dates and more. Choose a product and pack size to get started."}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Estimated prices and Pakistan shipping charges are confirmed with you before dispatch.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8">
        <aside className="hidden self-start rounded-xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24 lg:block">{Filters}</aside>
        <div className="min-w-0">
          <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-3 sm:px-4">
            <p className="text-sm font-semibold" aria-live="polite">
              {list.length} {list.length === 1 ? "product" : "products"} <span className="font-normal text-muted-foreground">found</span>
            </p>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {active && <button type="button" onClick={() => navigate({ search: {} })} className="min-h-10 rounded-md px-2 text-xs font-semibold text-primary hover:underline">Clear filters</button>}
              <Button variant="outline" size="sm" className="min-h-10 lg:hidden" onClick={() => setOpen(true)}>
                <SlidersHorizontal className="size-4" /> Filters
              </Button>
              <label className="sr-only" htmlFor="sort">Sort by</label>
              <select id="sort" aria-label="Sort products" value={s.sort ?? ""} onChange={(e) => set({ sort: e.target.value || undefined })}
                className="min-h-10 min-w-0 max-w-full rounded-md border border-input bg-card px-2 text-sm">
                <option value="">Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>
          {list.length ? (
            <div className="grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {list.map((p, i) => <ScrollReveal key={p.id} className="h-full" delay={Math.min(i % 4, 3) * 50}><ProductCard product={p} /></ScrollReveal>)}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border-strong py-16 text-center">
              <SearchX className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No products match your filters</p>
              <Link to="/shop" className="mt-2 inline-block text-sm text-primary">Clear filters</Link>
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-xl bg-background p-5 animate-in slide-in-from-bottom duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl">Filters</h2>
              <button className="tap-target" aria-label="Close filters" onClick={() => setOpen(false)}><X className="size-5" /></button>
            </div>
            {Filters}
            <Button variant="outline" block className="mt-3" onClick={() => setOpen(false)}>Show {list.length} results</Button>
          </div>
        </div>
      )}
    </div>
  );
}
