import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { TrustStrip } from "@/components/site/Footer";
import { resolveImage, useCatalog } from "@/lib/catalog";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — SweeTrade" },
      { name: "description", content: "SweeTrade brings carefully selected natural products to families across Pakistan. Sweet Taste… Healthy Life." },
      { property: "og:title", content: "About Us — SweeTrade" },
      { property: "og:description", content: "Sweet Taste… Healthy Life." },
    ],
  }),
  component: About,
});

function About() {
  const { content } = useCatalog();
  const about = content.about;
  return (
    <div className="container-page section-y">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">{about.eyebrow}</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">{about.title}</h1>
          <p className="mt-5 text-muted-foreground">
            {about.introduction}
          </p>
          <p className="mt-3 text-muted-foreground">{about.detail}</p>
          <Button asChild size="lg" className="mt-7"><Link to="/shop">Shop Products</Link></Button>
        </div>
        <img src={resolveImage(about.image)} alt="SweeTrade natural products" loading="lazy" className="aspect-4/3 w-full rounded-lg object-cover" />
      </div>
      <div className="mt-16"><TrustStrip /></div>
    </div>
  );
}
