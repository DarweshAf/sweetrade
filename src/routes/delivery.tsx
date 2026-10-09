import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/delivery")({
  head: () => ({ meta: [{ title: "Delivery Information | SweeTrade" }, { name: "description", content: "Information about delivery information at SweeTrade, Pakistan." }] }),
  component: Page,
});

function Page() {
  return <PolicyPage title="Delivery Information" policy="delivery" />;
}
