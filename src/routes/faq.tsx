import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/lib/catalog";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | SweeTrade" },
      { name: "description", content: "Find answers about ordering, pack sizes, provisional prices and Pakistan delivery requests at SweeTrade." },
      { name: "robots", content: "index,follow,max-image-preview:large" },
    ],
    links: [{ rel: "canonical", href: "https://sweetrade.pk/faq" }],
  }),
  component: Page,
});

function Page() {
  const { content } = useCatalog();
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="container-page max-w-4xl py-9 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Help Centre</p>
        <h1 className="mt-2 text-[clamp(2rem,6vw,3rem)] leading-tight">Frequently Asked Questions</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Quick answers about shopping, pack sizes, order requests and delivery across Pakistan.
        </p>
      </div>
      <div className="mt-7 space-y-3 sm:mt-9">
        {content.faq.items.map((item, i) => (
          <details key={i} className="group rounded-xl border border-border bg-card shadow-card" open={undefined}>
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-4 text-sm font-semibold marker:hidden sm:px-5 sm:text-base">
              <span className="min-w-0">{item.question}</span>
              <ChevronDown className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="border-t border-border px-4 py-4 text-sm leading-7 text-muted-foreground whitespace-pre-line sm:px-5">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h2 className="flex items-center gap-2 text-lg"><MessageCircle className="size-5 text-primary" aria-hidden /> Still need help?</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Our team can help you confirm product and delivery details.</p>
        </div>
        <Button asChild variant="outline" className="min-h-11 w-full rounded-lg sm:w-auto">
          <Link to="/contact">Contact Us <ArrowRight className="size-4" aria-hidden /></Link>
        </Button>
      </div>
    </div>
  );
}
