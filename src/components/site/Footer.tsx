import { Link } from "@tanstack/react-router";
import { FileText, Headphones, Leaf, MessageCircle, Phone, ShieldCheck, Truck, Mail, Facebook, Instagram } from "lucide-react";
import { useCatalog } from "@/lib/catalog";

const TRUST_ICONS = [Leaf, FileText, MessageCircle, Truck, Headphones];


export function TrustStrip({ compact = false }: { compact?: boolean }) {
  const { content } = useCatalog();
  const messages = compact ? content.footer.trust.slice(0, 4) : content.footer.trust;
  const items = messages.map((item, i) => ({ ...item, icon: TRUST_ICONS[i] ?? Leaf }));
  return (
    <ul className={`grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 ${compact ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}>
      {items.map(({ icon: Icon, title, body }, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 text-sm leading-tight">
            <p className="font-semibold">{title}</p>
            <p className="mt-0.5 text-muted-foreground">{body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  const { contact: CONTACT, categories: CATEGORIES, content } = useCatalog();
  return (
    <footer className="mt-auto">
      <div className="border-t border-border bg-surface">
        <div className="container-page py-8">
          <TrustStrip />
        </div>
      </div>
      <div className="bg-ink text-ink-foreground">
        <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-2xl">{content.footer.brandName}</p>
            <p className="mt-1 text-sm text-ink-foreground/70">{content.footer.tagline}</p>
            <p className="mt-4 max-w-xs text-sm text-ink-foreground/70">
              {content.footer.description}
            </p>
          </div>
          <div>
            <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-primary">Shop</h2>
            <ul className="space-y-2 text-sm text-ink-foreground/80">
              {CATEGORIES.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link to="/shop" search={{ category: c.slug }} className="hover:text-primary">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-primary">Help</h2>
            <ul className="space-y-2 text-sm text-ink-foreground/80">
              <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link to="/cart" className="hover:text-primary">Your Cart</Link></li>
              <li><Link to="/faq" className="hover:text-primary">FAQs</Link></li>
              <li><Link to="/delivery" className="hover:text-primary">Delivery Information</Link></li>
              <li><Link to="/returns" className="hover:text-primary">Returns & Exchanges</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
              <li><span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4" /> Payment options at checkout</span></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-primary">Contact</h2>
            <ul className="space-y-2 text-sm text-ink-foreground/80">
              <li className="flex items-center gap-2"><Phone className="size-4" /><a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="hover:text-primary">{CONTACT.phone}</a></li>
              {CONTACT.email && <li className="flex items-center gap-2"><Mail className="size-4" /> {CONTACT.email}</li>}
              {CONTACT.whatsapp && <li className="flex items-center gap-2"><MessageCircle className="size-4" /> WhatsApp ordering</li>}
              {content.footer.facebook && <li className="flex items-center gap-2"><Facebook className="size-4" /><a href={content.footer.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary">Facebook</a></li>}
              {content.footer.instagram && <li className="flex items-center gap-2"><Instagram className="size-4" /><a href={content.footer.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary">Instagram</a></li>}
            </ul>
          </div>
        </div>
        <div className="border-t border-ink-foreground/10">
          <p className="container-page py-4 text-xs text-ink-foreground/60">© {new Date().getFullYear()} {content.footer.brandName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
