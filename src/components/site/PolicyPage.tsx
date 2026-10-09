import { Link } from "@tanstack/react-router";
import { useCatalog } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import type { SiteContent } from "@/lib/site-content";

export function PolicyPage({ title, policy }: { title: string; policy: keyof SiteContent["policies"] }) {
  const { content } = useCatalog();
  const paragraphs = content.policies[policy].split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return <div className="container-page max-w-3xl py-10 sm:py-16">
    <h1 className="text-3xl sm:text-4xl">{title}</h1>
    <div className="mt-7 space-y-5 text-sm leading-7 text-muted-foreground">
      {paragraphs.map((text, i) => <p key={i} className="whitespace-pre-line">{text}</p>)}
    </div>
    <Button asChild variant="outline" className="mt-8"><Link to="/contact">Contact SweeTrade</Link></Button>
  </div>;
}
