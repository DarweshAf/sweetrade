import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions | Sweet Trade" }, { name: "description", content: "Information about terms & conditions at Sweet Trade, Karachi." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="container-page max-w-3xl py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl">Terms & Conditions</h1>
      <div className="mt-7 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>Sweet Trade is an online store serving customers in Karachi, Pakistan. Product information, stock and delivery options may change.</p>
        <p>When you submit a checkout form, an order request is created. The order remains subject to confirmation, product availability and delivery feasibility. Our team may contact you to verify order details.</p>
        <p>The cart and checkout display prices in Pakistani Rupees (PKR) and the applicable delivery fee. Contact us before ordering if you need confirmation of specifications, ingredients or availability.</p>
        <p>Payment and return arrangements depend on the confirmed order and applicable law. Please use the contact page if you have questions before ordering.</p>
      </div>
      <Button asChild variant="outline" className="mt-8"><Link to="/contact">Contact Sweet Trade</Link></Button>
    </div>
  );
}
