import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveImage, useCatalog } from "@/lib/catalog";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — SweeTrade" },
      { name: "description", content: "Meet SweeTrade and browse our honey, shilajit, saffron, olive oil, dates and other products across Pakistan." },
      { property: "og:title", content: "About Us — SweeTrade" },
      { property: "og:description", content: "Explore the SweeTrade product collection." },
    ],
  }),
  component: About,
});

function About() {
  const { content } = useCatalog();
  const about = content.about;
  return (
    <div className="container-page py-9 sm:py-14 lg:py-16">
      <div className="grid min-w-0 items-center gap-7 lg:grid-cols-2 lg:gap-12">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{about.eyebrow}</p>
          <h1 className="mt-3 max-w-[18ch] text-[clamp(2.2rem,7vw,3.6rem)] leading-[1.08]">{about.title}</h1>
          <p className="mt-5 max-w-[60ch] text-base leading-8 text-muted-foreground">{about.introduction}</p>
          <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground sm:text-base">{about.detail}</p>
          <div className="mt-7 grid w-full max-w-sm grid-cols-1 gap-3 min-[380px]:grid-cols-2">
            <Button asChild size="lg" className="min-h-12 rounded-lg normal-case tracking-normal">
              <Link to="/shop">Shop Products <ArrowRight className="size-4" aria-hidden /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-12 rounded-lg normal-case tracking-normal">
              <Link to="/contact"><MessageCircle className="size-4" aria-hidden /> Contact Us</Link>
            </Button>
          </div>
        </div>
        <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <img src={resolveImage(about.image)} alt="SweeTrade natural product collection"
            loading="lazy" decoding="async" className="aspect-[1.3/1] w-full object-cover lg:aspect-square" />
        </div>
      </div>
    </div>
  );
}
