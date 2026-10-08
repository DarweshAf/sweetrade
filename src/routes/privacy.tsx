import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy | Sweet Trade" }, { name: "description", content: "Information about privacy policy at Sweet Trade, Karachi." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="container-page max-w-3xl py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl">Privacy Policy</h1>
      <div className="mt-7 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>When you place an order, Sweet Trade collects the information you provide, such as your name, phone number, delivery area, address, selected products and any order notes.</p>
        <p>This information is used for managing the order, arranging delivery and communicating with you. Order information is stored in the store's database and is accessible to authorized administrators.</p>
        <p>If you contact us through an external service such as WhatsApp, that service may process information according to its own privacy policy.</p>
        <p>For questions about your order information or a request to review or correct it, please contact Sweet Trade. We will address requests in line with applicable law.</p>
      </div>
      <Button asChild variant="outline" className="mt-8"><Link to="/contact">Contact Sweet Trade</Link></Button>
    </div>
  );
}
