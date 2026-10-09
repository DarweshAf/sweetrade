import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Delivery Information | SweeTrade" },
      { name: "description", content: "Current SweeTrade delivery information for customers across Pakistan." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "https://sweetrade.pk/delivery" }],
  }),
  component: Page,
});

function Page() {
  return <PolicyPage title="Delivery Information" policy="delivery" />;
}
