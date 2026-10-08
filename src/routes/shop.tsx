import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X, SearchX } from "lucide-react";
import { formatPrice, priceFrom } from "@/data/catalog";
import { useCatalog } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/ProductCard";
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
          {[["in", "In Stock", products.filter((p) => p.inStock).length], ["out", "Out of Stock", products.filter((p) => !p.inStock).length]].map(([v, l, n]) => (
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
    <div className="container-page py-8 lg:py-10">
      <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden lg:block">{Filters}</aside>
        <div className="min-w-0">
          <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h1 className="truncate text-2xl sm:text-3xl">
              {s.q ? `Results for “${s.q}”` : cat?.name ?? "All Products"} <span className="font-sans text-base text-muted-foreground">({list.length})</span>
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOpen(true)}><SlidersHorizontal /> Filters</Button>
              <label className="sr-only" htmlFor="sort">Sort by</label>
              <select id="sort" value={s.sort ?? ""} onChange={(e) => set({ sort: e.target.value || undefined })} className="h-9 rounded-md border border-input bg-card px-2 text-sm">
                <option value="">Sort by: Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>
          {list.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {list.map((p) => <ProductCard key={p.id} product={p} />)}
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
