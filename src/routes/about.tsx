import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { TrustStrip } from "@/components/site/Footer";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Sweet Trade" },
      { name: "description", content: "Sweet Trade brings carefully selected natural products to families across Karachi. Sweet Taste… Healthy Life." },
      { property: "og:title", content: "About Us — Sweet Trade" },
      { property: "og:description", content: "Sweet Taste… Healthy Life." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="container-page section-y">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">A sweet way to trade</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Sweet Taste… Healthy Life</h1>
          <p className="mt-5 text-muted-foreground">
            Sweet Trade offers carefully selected natural products — honey, shilajit, saffron, olive oil, dates, pickles and traditional sweets — delivered with care across Karachi.
          </p>
          <p className="mt-3 text-muted-foreground">We keep things simple: clear product information, honest pricing and easy ordering by phone or WhatsApp.</p>
          <Button asChild size="lg" className="mt-7"><Link to="/shop">Shop Products</Link></Button>
        </div>
        <img src={hero} alt="Natural products on a wooden table" loading="lazy" className="aspect-4/3 w-full rounded-lg object-cover" />
      </div>
      <div className="mt-16"><TrustStrip /></div>
    </div>
  );
}
