import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";
import { useCatalog } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — SweeTrade" },
      { name: "description", content: "Contact SweeTrade to ask about products, pack sizes, pending orders and delivery to your city in Pakistan." },
      { property: "og:title", content: "Contact Us — SweeTrade" },
      { property: "og:description", content: "Questions about products or an order? Our team is here to help." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { contact } = useCatalog();
  const methods = [
    { icon: Phone, label: "Call Us", description: "Speak to us about products and orders.", value: contact.phone, action: "Call Now", href: `tel:${contact.phone.replace(/\s/g, "")}` },
    ...(contact.whatsapp ? [{
      icon: MessageCircle, label: "WhatsApp", description: "Ask a question or confirm an order.",
      value: "Chat with our team", action: "Open WhatsApp", href: `https://wa.me/${contact.whatsapp}`,
    }] : []),
    ...(contact.email ? [{
      icon: Mail, label: "Email", description: "Send a question to our business inbox.",
      value: contact.email, action: "Send Email", href: `mailto:${contact.email}`,
    }] : []),
  ];

  return (
    <div className="container-page py-9 sm:py-14 lg:py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">We are here to help</p>
        <h1 className="mt-2 text-[clamp(2rem,6vw,3rem)] leading-tight">Get in Touch</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Need help choosing a product or confirming a delivery? Reach our team through your preferred contact method.
        </p>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {methods.map(({ icon: Icon, label, description, value, href, action }) => (
          <li key={label} className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
              <Icon className="size-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-xl">{label}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
            <p className="mt-3 min-w-0 break-words text-sm font-semibold">{value}</p>
            <Button asChild variant="outline" className="mt-auto min-h-11 w-full rounded-lg pt-2 sm:mt-6">
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
                {action} <ArrowRight className="size-4" aria-hidden />
              </a>
            </Button>
          </li>
        ))}
      </ul>
      <div className="mt-9 flex flex-col items-start justify-between gap-3 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h2 className="text-lg">Need to understand the order process?</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Learn how pack sizes, provisional prices and Pakistan delivery requests work.</p>
        </div>
        <Link to="/faq" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:underline">
          Read FAQs <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
