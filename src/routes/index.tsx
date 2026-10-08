import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { resolveImage, useCatalog } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sweet Trade — Experience Nature's Finest" },
      { name: "description", content: "Carefully selected honey, saffron, shilajit, olive oil, dates and traditional delicacies, available to customers across Pakistan." },
      { property: "og:title", content: "Sweet Trade — Experience Nature's Finest" },
      { property: "og:description", content: "Explore natural products for customers across Pakistan." },
    ],
  }),
  component: Home,
});

const HIGHLIGHT_ICONS = [ShieldCheck, Heart, Truck, MessageCircle];

function Promo({ img, title, sub, cat, big = false }: { img: string; title: string; sub: string; cat: string; big?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${big ? "min-h-48 sm:min-h-56" : "min-h-44"}`}>
      <img src={img} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      <div className="promo-overlay absolute inset-0" />
      <div className="relative flex h-full flex-col justify-center p-6 text-ink-foreground sm:p-8">
        <h3 className={big ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}>{title}</h3>
        <p className="mt-1 text-sm opacity-90">{sub}</p>
        <Button asChild size="sm" variant="secondary" className="mt-4 w-fit">
          <Link to="/shop" search={{ category: cat }}>Shop Now <ArrowRight /></Link>
        </Button>
      </div>
    </div>
  );
}

function Home() {
  const { categories: CATEGORIES, countIn, products, settings, isPreview, requiresPricing, content } = useCatalog();
  const hw = settings.heroTitle.trim().split(/\s+/);
  const heroTail = hw.length > 2 ? hw.slice(-2).join(" ") : hw.join(" ");
  const heroLead = hw.length > 2 ? hw.slice(0, -2).join(" ") : "";
  const featured = products.filter((p) => p.featured);
  return (
    <>
      <section className="relative overflow-hidden">
        <img src={resolveImage(content.home.heroImage)} alt="Sweet Trade natural products" width={1600} height={912} className="absolute inset-0 size-full object-cover object-right" />
        <div className="hero-fade absolute inset-0" />
        <div className="container-page relative py-16 sm:py-24 lg:py-28">
          <div className="max-w-lg">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl">
              {heroLead} <span className="block text-primary">{heroTail}</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              {settings.heroSubtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/shop">Shop Now</Link></Button>
              <Button asChild size="lg" variant="outline" className="bg-card"><a href="#categories">Explore Categories</a></Button>
            </div>
          </div>
        </div>
      </section>

      {(isPreview || requiresPricing) && <div role="status" className="border-y border-border bg-secondary"><p className="container-page py-3 text-center text-sm">Sample prices are shown for demonstration only, not as final selling prices. Online purchasing remains disabled until Sweet Trade verifies each product’s prices and delivery details. <Link to="/contact" className="font-semibold text-primary underline">Contact Sweet Trade</Link> for confirmed prices and availability.</p></div>}
      <section className="border-b border-border bg-card">
        <ul className="container-page grid grid-cols-2 gap-4 py-5 lg:grid-cols-4">
          {content.home.highlights.map((feature, i) => {
            const I = HIGHLIGHT_ICONS[i] ?? ShieldCheck;
            return <li key={i} className="flex items-center gap-3 text-sm leading-tight">
              <I className="size-7 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
              <span><span className="block font-medium">{feature.title}</span><span className="text-muted-foreground">{feature.body}</span></span>
            </li>;
          })}
        </ul>
      </section>

      <section id="categories" className="container-page section-y">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl">Shop by Category</h2>
          <Link to="/shop" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">View All <ArrowRight className="size-4" /></Link>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-7">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="group w-28 shrink-0 snap-start sm:w-auto">
              <div className="img-frame aspect-square rounded-lg">
                <img src={c.image} alt={c.name} loading="lazy" className="hover-zoom size-full object-cover" />
              </div>
              <p className="mt-2 text-sm font-semibold leading-tight group-hover:text-primary">{c.name}</p>
              <p className="text-xs text-muted-foreground">{countIn(c.slug)} Products</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-10 sm:pb-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl">Featured Products</h2>
          <Link to="/shop" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">View All <ArrowRight className="size-4" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {featured.length ? featured.map((p) => <ProductCard key={p.id} product={p} showFrom />) : <p className="col-span-full text-sm text-muted-foreground">Featured products will appear here when available.</p>}
        </div>
      </section>

      {content.home.promos.length > 0 && (
        <section className="container-page grid gap-4 pb-12 sm:pb-16">
          <Promo big img={resolveImage(content.home.promos[0].image)}
            title={content.home.promos[0].title} sub={content.home.promos[0].sub} cat={content.home.promos[0].category} />
          {content.home.promos.length > 1 && <div className="grid gap-4 md:grid-cols-2">
            {content.home.promos.slice(1).map((promo, i) => <Promo key={i}
              img={resolveImage(promo.image)} title={promo.title} sub={promo.sub} cat={promo.category} />)}
          </div>}
        </section>
      )}
    </>
  );
}
