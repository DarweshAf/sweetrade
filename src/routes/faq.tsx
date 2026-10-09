import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/lib/catalog";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "Frequently Asked Questions | SweeTrade" }, { name: "description", content: "Information about frequently asked questions at SweeTrade, Pakistan." }] }),
  component: Page,
});

function Page() {
  const { content } = useCatalog();
  return (
    <div className="container-page max-w-3xl py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl">Frequently Asked Questions</h1>
      <div className="mt-7 space-y-5 text-sm leading-7 text-muted-foreground">
        {content.faq.items.map((item, i) => (
          <section key={i}>
            <h2 className="text-lg text-foreground">{item.question}</h2>
            <p className="whitespace-pre-line">{item.answer}</p>
          </section>
        ))}
      </div>
      <Button asChild variant="outline" className="mt-8"><Link to="/contact">Contact SweeTrade</Link></Button>
    </div>
  );
}
