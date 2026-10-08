import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/delivery")({
  head: () => ({ meta: [{ title: "Delivery Information | Sweet Trade" }, { name: "description", content: "Information about delivery information at Sweet Trade, Pakistan." }] }),
  component: Page,
});

function Page() {
  return <PolicyPage title="Delivery Information" policy="delivery" />;
}
