import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, ClipboardCheck, Heart, MessageCircle, PhoneCall,
  ShieldCheck, ShoppingBag, Truck,
} from "lucide-react";
import { resolveImage, useCatalog } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/ProductCard";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { StoreHero } from "@/components/site/StoreHero";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Natural Favorites, Made Easy | SweeTrade Pakistan" },
      { name: "description", content: "Shop natural favorites: honey, saffron, shilajit, olive oil, dates and more. Choose your size and request an order from across Pakistan." },
      { property: "og:title", content: "Natural Favorites, Made Easy | SweeTrade Pakistan" },
      { property: "og:description", content: "Explore natural products for customers across Pakistan." },
    ],
  }),
  component: Home,
});

const HIGHLIGHT_ICONS = [ShieldCheck, Heart, Truck, MessageCircle];
const ORDER_ICONS = [ShoppingBag, ClipboardCheck, PhoneCall];

function SectionHeading({ eyebrow, title, description, linkText = "Shop all" }: {
  eyebrow: string; title: string; description: string; linkText?: string;
}) {
  return (
    <div className="mb-6 flex flex-col items-start gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
        <h2 className="mt-1.5 text-[clamp(1.65rem,4.5vw,2.3rem)] leading-tight tracking-tight">{title}</h2>
        {description && <p className="mt-2 max-w-[64ch] text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>}
      </div>
      <Link to="/shop" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg text-sm font-semibold text-primary underline-offset-4 hover:underline">
        {linkText} <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

function Promo({ img, title, sub, cat, big = false }: {
  img: string; title: string; sub: string; cat: string; big?: boolean;
}) {
  return (
    <article className={`group relative isolate flex min-h-[225px] min-w-0 items-end overflow-hidden rounded-2xl bg-ink shadow-card sm:min-h-[245px] ${big ? "lg:min-h-[490px]" : "lg:min-h-[236px]"}`}>
      <img src={img} alt="" loading="lazy" decoding="async" className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.04]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-ink/95 via-ink/55 to-ink/5" />
      <div className="relative w-full p-5 text-ink-foreground sm:p-7">
        <h3 className={`max-w-[20ch] text-balance leading-[1.1] ${big ? "text-[clamp(1.8rem,4.5vw,2.8rem)]" : "text-[clamp(1.45rem,3.3vw,2rem)]"}`}>{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-5 text-ink-foreground/90">{sub}</p>
        <Button asChild size="sm" variant="secondary" className="mt-4 min-h-11 rounded-lg px-4 font-semibold normal-case tracking-normal">
          <Link to="/shop" search={{ category: cat }}>Explore Collection <ArrowRight className="size-4" aria-hidden /></Link>
        </Button>
      </div>
    </article>
  );
}

function Home() {
  const { categories, countIn, products, settings, isPreview, requiresPricing, content } = useCatalog();
  const home = content.home;
  const featured = products.filter((p) => p.featured);
  const promoMain = home.promos[0];
  const morePromos = home.promos.slice(1);

  return (
    <>
      <StoreHero title={settings.heroTitle} description={settings.heroSubtitle} image={home.heroImage} />

      {(isPreview || requiresPricing || settings.pendingOrdersEnabled) && (
        <div className="border-y border-border bg-secondary">
          <p className="container-page py-2.5 text-center text-xs leading-5 sm:text-sm">
            {settings.pendingOrdersEnabled && !isPreview
              ? "Order requests open · Final prices and delivery confirmed by phone."
              : "Browse our collection · Contact us to confirm availability and prices."}
            {" "}<Link to="/faq" className="font-semibold text-primary underline underline-offset-2">How ordering works</Link>
          </p>
        </div>
      )}

      {home.highlights.length > 0 && (
        <section aria-label="Why shop SweeTrade" className="border-b border-border bg-card">
          <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-4 py-5 sm:gap-x-6 sm:gap-y-5 sm:py-6 lg:grid-cols-4">
            {home.highlights.map((feature, i) => {
              const Icon = HIGHLIGHT_ICONS[i] ?? ShieldCheck;
              return <li key={i} className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary sm:size-11">
                  <Icon className="size-4.5 sm:size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="block text-xs font-semibold leading-5 text-foreground sm:text-sm">{feature.title}</span>
                  <span className="mt-0.5 block text-xs leading-4.5 text-muted-foreground sm:text-sm sm:leading-5">{feature.body}</span>
                </span>
              </li>;
            })}
          </ul>
        </section>
      )}

      <ScrollReveal>
        <section id="categories" className="container-page scroll-mt-24 py-10 sm:py-14 xl:scroll-mt-28">
          <SectionHeading eyebrow="Browse the range" title={home.categoriesHeading}
            description={home.categoriesDescription} linkText="All categories" />
          <p className="mb-2 text-xs text-muted-foreground sm:hidden">Swipe to explore <span aria-hidden="true">→</span></p>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-7">
            {categories.map((cat) => {
              const n = countIn(cat.slug);
              return (
                <Link key={cat.slug} to="/shop" search={{ category: cat.slug }}
                  className="group block w-40 shrink-0 snap-start rounded-xl border border-border bg-card p-2 shadow-card transition-colors hover:border-primary/50 sm:w-auto sm:p-2.5">
                  <div className="img-frame aspect-[1.15/1] rounded-lg">
                    <img src={cat.image} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.04]" />
                  </div>
                  <span className="mt-3 block min-h-9 text-sm font-semibold leading-5 text-foreground group-hover:text-primary">{cat.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{n} {n === 1 ? "product" : "products"}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="border-y border-border bg-surface/60 py-10 sm:py-14">
          <div className="container-page">
            <SectionHeading eyebrow="Selected for you" title={home.featuredHeading}
              description={home.featuredDescription} linkText="View all products" />
            {featured.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {featured.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border-strong bg-card p-8 text-center text-sm text-muted-foreground">
                Explore the full range while we prepare our featured selection.
              </p>
            )}
          </div>
        </section>
      </ScrollReveal>

      {promoMain && (
        <ScrollReveal>
          <section className="container-page py-10 sm:py-14">
            <SectionHeading eyebrow="Discover more" title={home.collectionsHeading}
              description={home.collectionsDescription} linkText="Browse the shop" />
            <div className={`grid gap-4 ${morePromos.length ? "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]" : ""}`}>
              <Promo big img={resolveImage(promoMain.image)} title={promoMain.title} sub={promoMain.sub} cat={promoMain.category} />
              {morePromos.length > 0 && (
                <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {morePromos.map((promo, i) => <Promo key={i} img={resolveImage(promo.image)}
                    title={promo.title} sub={promo.sub} cat={promo.category} />)}
                </div>
              )}
            </div>
          </section>
        </ScrollReveal>
      )}

      {home.orderingSteps.length > 0 && (
        <ScrollReveal>
          <section className="border-t border-border bg-card py-10 sm:py-14" aria-labelledby="ordering-steps-heading">
            <div className="container-page">
              <div className="mb-6 max-w-2xl sm:mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Easy from start to finish</p>
                <h2 id="ordering-steps-heading" className="mt-2 text-[clamp(1.65rem,4.5vw,2.3rem)]">{home.orderingHeading}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">{home.orderingDescription}</p>
              </div>
              <ol className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                {home.orderingSteps.map((step, i) => {
                  const Icon = ORDER_ICONS[i] ?? ClipboardCheck;
                  return <li key={i} className="flex min-w-0 items-start gap-4 rounded-xl border border-border bg-background p-4 sm:flex-col sm:gap-3 sm:p-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <Icon className="size-5" strokeWidth={1.8} aria-hidden />
                    </span>
                    <span className="block min-w-0">
                      <span className="text-xs font-semibold text-primary">Step {i + 1}</span>
                      <span className="mt-0.5 block text-base font-semibold leading-6">{step.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-muted-foreground">{step.body}</span>
                    </span>
                  </li>;
                })}
              </ol>
              <Link to="/faq" className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                Questions about ordering? <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </section>
        </ScrollReveal>
      )}
    </>
  );
}
