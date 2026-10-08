import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions | Sweet Trade" }, { name: "description", content: "Information about terms & conditions at Sweet Trade, Pakistan." }] }),
  component: Page,
});

function Page() {
  return <PolicyPage title="Terms & Conditions" policy="terms" />;
}
