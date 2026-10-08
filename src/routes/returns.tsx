import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/returns")({
  head: () => ({ meta: [{ title: "Returns & Exchanges | Sweet Trade" }, { name: "description", content: "Information about returns & exchanges at Sweet Trade, Karachi." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="container-page max-w-3xl py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl">Returns & Exchanges</h1>
      <div className="mt-7 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>If your order is damaged, incorrect or otherwise not as expected, please contact Sweet Trade as soon as possible with your order reference and relevant photos.</p>
        <p>Our team will review the issue and explain the options available for your product and circumstances. Product-specific return eligibility and procedures should be confirmed before sending an item back.</p>
        <p>This page does not limit any rights that customers have under applicable law.</p>
      </div>
      <Button asChild variant="outline" className="mt-8"><Link to="/contact">Contact Sweet Trade</Link></Button>
    </div>
  );
}
