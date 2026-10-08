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
          <Logo className="h-10 lg:h-14" />

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
            <Link to="/cart" className="tap-target relative -mr-2 hidden sm:inline-flex" aria-label={`Cart, ${count} items`}>
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

      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {[
          { to: "/", label: "Home", icon: Home, exact: true },
          { to: "/shop", label: "Shop", icon: Store, exact: false },
          { to: "/contact", label: "Contact", icon: Phone, exact: false },
          { to: "/cart", label: "Cart", icon: ShoppingCart, exact: false },
          { to: "/auth", label: "Account", icon: User, exact: false },
        ].map((n) => (
          <Link
            key={n.label}
            to={n.to}
            activeOptions={{ exact: n.exact }}
            className="relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground data-[status=active]:text-primary"
          >
            <n.icon className="size-5" aria-hidden />
            {n.label}
            {n.label === "Cart" && count > 0 && (
              <span className="absolute right-[calc(50%-1.4rem)] top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </>
  );
}
