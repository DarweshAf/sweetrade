import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Exchanges | SweeTrade" },
      { name: "description", content: "Current returns and exchange information for SweeTrade orders in Pakistan." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "https://sweetrade.pk/returns" }],
  }),
  component: Page,
});

function Page() {
  return <PolicyPage title="Returns & Exchanges" policy="returns" />;
}
