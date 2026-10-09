import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions | SweeTrade" }, { name: "description", content: "Information about terms & conditions at SweeTrade, Pakistan." }] }),
  component: Page,
});

function Page() {
  return <PolicyPage title="Terms & Conditions" policy="terms" />;
}
