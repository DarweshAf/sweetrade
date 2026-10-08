import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Home, MessageCircle, Phone, Search, ShoppingCart, Store, User } from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/data/catalog";
import { useCatalog } from "@/lib/catalog";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "Categories" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

function SearchBox({ onDone }: { onDone?: () => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  return (
    <form
      role="search"
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/shop", search: { q: q || undefined } });
        onDone?.();
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        aria-label="Search natural products"
        placeholder="Search natural products..."
        className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
    </form>
  );
}

export function Header() {
  const { contact: CONTACT } = useCatalog();
  const { count } = useStore();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="bg-ink text-ink-foreground">
        <div className="container-page flex h-9 items-center justify-center gap-6 text-xs sm:justify-between">
          <span className="hidden sm:block" />
          <p className="text-center">
            Free delivery in Karachi on orders above {formatPrice(CONTACT.freeDeliveryThreshold)}
          </p>
          <div className="hidden items-center gap-4 sm:flex">
            <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-primary">
              <Phone className="size-3.5" aria-hidden /> {CONTACT.phone}
            </a>
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary">
              <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-page grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 lg:h-20 lg:gap-8">
          <div className="flex items-center gap-1">
            <button className="tap-target -ml-2 lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
              <Menu className="size-5" />
            </button>
            <Logo className="h-10 lg:h-14" />
          </div>

          <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                activeOptions={{ exact: true }}
                className="text-sm font-medium text-foreground transition-colors hover:text-primary data-[status=active]:text-primary"
              >
                {n.label}
              </Link>
            ))}
            <div className="ml-2 w-64 xl:w-72">
              <SearchBox />
            </div>
          </nav>
          <span className="lg:hidden" />

          <div className="flex items-center">
            <button className="tap-target lg:hidden" aria-label="Search" onClick={() => setSearchOpen((s) => !s)}>
              <Search className="size-5" />
            </button>
            <Link to="/contact" className="tap-target hidden sm:inline-flex" aria-label="Account">
              <User className="size-5" />
            </Link>
            <Link to="/shop" className="tap-target hidden sm:inline-flex" aria-label="Wishlist">
              <Heart className="size-5" />
            </Link>
            <Link to="/cart" className="tap-target relative -mr-2" aria-label={`Cart, ${count} items`}>
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <span className="absolute right-1 top-1 grid min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4.5 text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
        {searchOpen && (
          <div className="container-page pb-3 lg:hidden">
            <SearchBox onDone={() => setSearchOpen(false)} />
          </div>
        )}
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col bg-background p-5 animate-in slide-in-from-left duration-200">
            <div className="mb-6 flex items-center justify-between">
              <Logo className="h-10" />
              <button className="tap-target" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col">
              {NAV.map((n) => (
                <Link key={n.label} to={n.to} onClick={() => setOpen(false)} className="border-b border-border py-3.5 text-base font-medium">
                  {n.label}
                </Link>
              ))}
            </nav>
            <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="mt-auto inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4" /> {CONTACT.phone}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
