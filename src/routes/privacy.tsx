import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy | SweeTrade" }, { name: "description", content: "Information about privacy policy at SweeTrade, Pakistan." }] }),
  component: Page,
});

function Page() {
  return <PolicyPage title="Privacy Policy" policy="privacy" />;
}
