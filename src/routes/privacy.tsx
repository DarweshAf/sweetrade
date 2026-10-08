import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy | Sweet Trade" }, { name: "description", content: "Information about privacy policy at Sweet Trade, Karachi." }] }),
  component: Page,
});

function Page() {
  return <PolicyPage title="Privacy Policy" policy="privacy" />;
}
