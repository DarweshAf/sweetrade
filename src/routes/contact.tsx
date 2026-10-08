import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { useCatalog } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SweeTrade" },
      { name: "description", content: "Call, WhatsApp or email SweeTrade for orders and product questions in Karachi." },
      { property: "og:title", content: "Contact — SweeTrade" },
      { property: "og:description", content: "We are here to help." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { contact: CONTACT } = useCatalog();
  const items = [
    { icon: Phone, label: "Call us", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: `https://wa.me/${CONTACT.whatsapp}` },
    { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  ];
  return (
    <div className="container-page section-y max-w-3xl">
      <h1 className="text-4xl">Contact Us</h1>
      <p className="mt-3 text-muted-foreground">Questions about a product or an order? Reach us any way you like.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {items.map(({ icon: I, label, value, href }) => (
          <li key={label} className="rounded-lg border border-border bg-card p-5">
            <I className="size-6 text-primary" />
            <p className="mt-3 text-sm font-semibold">{label}</p>
            <p className="text-sm text-muted-foreground break-words">{value}</p>
            <Button asChild variant="outline" size="sm" className="mt-4"><a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">Open</a></Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
