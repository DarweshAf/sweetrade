import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/delivery")({
  head: () => ({ meta: [{ title: "Delivery Information | Sweet Trade" }, { name: "description", content: "Information about delivery information at Sweet Trade, Karachi." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="container-page max-w-3xl py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl">Delivery Information</h1>
      <div className="mt-7 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>Sweet Trade serves Karachi, Pakistan. Delivery availability and charges depend on the order and the address entered at checkout.</p>
        <p>Review the delivery fee and order total before placing an order. For a confirmed delivery estimate or an address outside the available areas, contact our team directly.</p>
        <p>Do not rely on a specific delivery date until it has been confirmed by our team.</p>
      </div>
      <Button asChild variant="outline" className="mt-8"><Link to="/contact">Contact Sweet Trade</Link></Button>
    </div>
  );
}
