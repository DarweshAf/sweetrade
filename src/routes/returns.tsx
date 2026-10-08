import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/returns")({
  head: () => ({ meta: [{ title: "Returns & Exchanges | Sweet Trade" }, { name: "description", content: "Information about returns & exchanges at Sweet Trade, Pakistan." }] }),
  component: Page,
});

function Page() {
  return <PolicyPage title="Returns & Exchanges" policy="returns" />;
}
