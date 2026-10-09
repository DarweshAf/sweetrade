import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveImage } from "@/lib/catalog";

interface StoreHeroProps {
  title: string;
  description: string;
  image: string;
}

/**
 * Conversion-first, mobile-first hero.
 * The copy stays in Admin > Settings; only the comma-separated second
 * phrase receives the accent color. On mobile, all copy and CTAs remain
 * readable on a solid surface instead of overlaying a busy photograph.
 */
export function StoreHero({ title, description, image }: StoreHeroProps) {
  const heading = title.trim() || "Natural Favorites, Made Easy";
  const comma = heading.indexOf(",");
  const lead = comma >= 0 ? heading.slice(0, comma).trim() : heading;
  const accent = comma >= 0 ? heading.slice(comma + 1).trim() : "";

  return (
    <section aria-labelledby="home-hero-title" className="overflow-hidden border-b border-border bg-background">
      <div className="container-page grid min-w-0 items-center gap-6 py-7 sm:gap-8 sm:py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 lg:py-12 xl:gap-14 xl:py-16">
        <div className="wow-hero-copy order-1 flex min-w-0 flex-col items-start lg:py-7">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-semibold tracking-wide text-primary sm:text-sm">
            <Sparkles className="size-4 shrink-0" aria-hidden="true" />
            Natural finds for everyday living
          </p>

          <h1 id="home-hero-title" className="mt-5 max-w-[18ch] text-[clamp(2.25rem,8.5vw,3.5rem)] leading-[1.08] tracking-tight text-foreground sm:mt-6 lg:max-w-[15ch] lg:text-[clamp(3rem,4.1vw,4.7rem)]">
            {lead}
            {accent && <span className="block text-primary">{accent}</span>}
          </h1>

          <p className="mt-4 max-w-[52ch] text-base leading-7 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-8">
            {description}
          </p>

          <div className="wow-hero-actions mt-6 grid w-full max-w-md grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:mt-7">
            <Button asChild size="lg" className="min-h-12 w-full rounded-lg px-4 normal-case tracking-normal sm:text-base">
              <Link to="/shop">Shop Products <ArrowRight className="size-4" aria-hidden /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-12 w-full rounded-lg border-border-strong bg-card px-4 normal-case tracking-normal sm:text-base">
              <a href="#categories">Browse Categories</a>
            </Button>
          </div>

          <p className="mt-5 flex max-w-md items-start gap-2 text-xs leading-5 text-muted-foreground sm:mt-6 sm:text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            Requests from across Pakistan. Final prices and shipping are confirmed before dispatch.
          </p>
        </div>

        <div className="relative order-2 min-w-0">
          <div className="relative aspect-[1.54/1] overflow-hidden rounded-2xl bg-surface shadow-raised ring-1 ring-border sm:aspect-[1.7/1] lg:aspect-[1.08/1] lg:rounded-3xl xl:aspect-[1.17/1]">
            <img
              src={resolveImage(image)}
              alt="SweeTrade's natural product collection"
              width={1600}
              height={912}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              sizes="(max-width: 1023px) 100vw, 52vw"
              className="wow-hero-image absolute inset-0 size-full object-cover object-center"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/15 to-transparent sm:h-24" />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-3 -right-3 -z-10 size-28 rounded-3xl bg-primary-soft sm:-bottom-5 sm:-right-5 sm:size-40" />
        </div>
      </div>
    </section>
  );
}
