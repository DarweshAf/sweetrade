import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "Frequently Asked Questions | Sweet Trade" }, { name: "description", content: "Information about frequently asked questions at Sweet Trade, Karachi." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="container-page max-w-3xl py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl">Frequently Asked Questions</h1>
      <div className="mt-7 space-y-5 text-sm leading-7 text-muted-foreground">
        <section><h2 className="text-lg text-foreground">How do I order?</h2><p>Browse the shop, select your product and size, add it to your cart and complete guest checkout.</p></section>
        <section><h2 className="text-lg text-foreground">Where do you deliver?</h2><p>Delivery is offered in Karachi. Enter your area at checkout or contact us to confirm your location.</p></section>
        <section><h2 className="text-lg text-foreground">How much is delivery?</h2><p>The cart and checkout show the configured delivery charge before you place an order.</p></section>
        <section><h2 className="text-lg text-foreground">How can I confirm ingredients or availability?</h2><p>Please contact our team before ordering if you need specific product information.</p></section>
        <section><h2 className="text-lg text-foreground">Do I need an account?</h2><p>No. You can check out as a guest.</p></section>
      </div>
      <Button asChild variant="outline" className="mt-8"><Link to="/contact">Contact Sweet Trade</Link></Button>
    </div>
  );
}
