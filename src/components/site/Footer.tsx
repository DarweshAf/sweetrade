import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight, Facebook, FileText, Headphones, Instagram,
  Leaf, Mail, MessageCircle, Phone, Truck,
} from "lucide-react";
import { useCatalog } from "@/lib/catalog";

const TRUST_ICONS = [Leaf, FileText, MessageCircle, Truck, Headphones];

export function TrustStrip({ compact = false }: { compact?: boolean }) {
  const { content } = useCatalog();
  const messages = compact ? content.footer.trust.slice(0, 4) : content.footer.trust;
  return (
    <ul className={`grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 sm:grid-cols-3 sm:gap-5 ${compact ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}>
      {messages.map((item, i) => {
        const Icon = TRUST_ICONS[i] ?? Leaf;
        return (
          <li key={i} className="flex min-w-0 items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-5">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.body}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const HELP_LINKS = [
  { to: "/faq", label: "How to order / FAQs" },
  { to: "/delivery", label: "Delivery information" },
  { to: "/returns", label: "Returns & exchanges" },
  { to: "/privacy", label: "Privacy policy" },
  { to: "/terms", label: "Terms & conditions" },
] as const;

export function Footer() {
  const { contact, categories, content } = useCatalog();
  const onHome = useRouterState({ select: (state) => state.location.pathname === "/" });
  const name = content.footer.brandName || "SweeTrade";
  return (
    <footer className="mt-auto">
      {!onHome && content.footer.trust.length > 0 && (
        <section aria-label="Shopping information" className="border-t border-border bg-surface">
          <div className="container-page py-7 sm:py-9"><TrustStrip /></div>
        </section>
      )}

      <div className="bg-ink text-ink-foreground">
        <div className="container-page grid gap-x-7 gap-y-9 py-11 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-12 lg:gap-x-8 lg:py-14">
          <div className="sm:col-span-2 lg:col-span-4">
            <p className="font-display text-3xl tracking-tight">{name}</p>
            <p className="mt-2 text-sm font-medium text-ink-foreground/90">{content.footer.tagline}</p>
            <p className="mt-3 max-w-sm text-sm leading-7 text-ink-foreground/70">{content.footer.description}</p>
            <Link to="/shop" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink-foreground/30 px-4 text-sm font-semibold text-ink-foreground transition-colors hover:border-primary hover:text-primary">
              Browse Products <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>

          <nav aria-label="Shop links" className="min-w-0 sm:col-span-1 lg:col-span-2">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-primary">Shop</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-foreground/80">
              {categories.slice(0, 5).map((category) => (
                <li key={category.slug}>
                  <Link to="/shop" search={{ category: category.slug }} className="inline-flex min-h-7 hover:text-primary">{category.name}</Link>
                </li>
              ))}
              <li><Link to="/shop" className="inline-flex min-h-7 font-semibold text-ink-foreground hover:text-primary">All products</Link></li>
            </ul>
          </nav>

          <nav aria-label="Help links" className="min-w-0 sm:col-span-1 lg:col-span-3">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-primary">Customer Care</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-foreground/80">
              <li><Link to="/about" className="inline-flex min-h-7 hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="inline-flex min-h-7 hover:text-primary">Contact Us</Link></li>
              <li><Link to="/cart" className="inline-flex min-h-7 hover:text-primary">Your Cart</Link></li>
              {HELP_LINKS.map((link) => (
                <li key={link.to}><Link to={link.to} className="inline-flex min-h-7 hover:text-primary">{link.label}</Link></li>
              ))}
            </ul>
          </nav>

          <section aria-label="Contact details" className="min-w-0 sm:col-span-2 lg:col-span-3">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-primary">Get in Touch</h2>
            <p className="mt-4 text-sm leading-6 text-ink-foreground/70">
              Questions about a product or an order? Contact our team for assistance.
            </p>
            <ul className="mt-4 space-y-4 text-sm leading-6 text-ink-foreground/85">
              <li className="flex items-start gap-3">
                <Phone className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="min-w-0 break-words hover:text-primary">{contact.phone}</a>
              </li>
              {contact.email && (
                <li className="flex items-start gap-3">
                  <Mail className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                  <a href={`mailto:${contact.email}`} className="min-w-0 break-all hover:text-primary">{contact.email}</a>
                </li>
              )}
              {contact.whatsapp && (
                <li className="flex items-start gap-3">
                  <MessageCircle className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                  <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    WhatsApp us <ArrowUpRight className="ml-1 inline size-3.5" aria-hidden />
                  </a>
                </li>
              )}
              {content.footer.facebook && (
                <li className="flex items-start gap-3"><Facebook className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                  <a href={content.footer.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary">Facebook</a>
                </li>
              )}
              {content.footer.instagram && (
                <li className="flex items-start gap-3"><Instagram className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                  <a href={content.footer.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary">Instagram</a>
                </li>
              )}
            </ul>
          </section>
        </div>
        <div className="border-t border-ink-foreground/15">
          <div className="container-page flex flex-col gap-1 py-4 text-xs leading-5 text-ink-foreground/65 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
            <p>Order requests across Pakistan · Final amounts confirmed by phone</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
