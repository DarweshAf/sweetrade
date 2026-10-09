import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Home, MessageCircle, Phone, Search, ShoppingCart, Grid2X2 } from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/data/catalog";
import { useCatalog } from "@/lib/catalog";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
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
        autoFocus={Boolean(onDone)}
        aria-label="Search natural products"
        placeholder="Search natural products..."
        className="min-h-11 w-full min-w-0 rounded-lg border border-input bg-card pl-9 pr-3 text-base sm:text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
    </form>
  );
}

export function Header() {
  const { contact: CONTACT, categories, content } = useCatalog();
  const { count } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="bg-ink text-ink-foreground">
        <div className="container-page flex min-h-9 items-center justify-center gap-4 py-1 text-[11px] sm:justify-between sm:text-xs">
          <span className="hidden sm:block" />
          <p className="max-w-full text-center leading-4 sm:max-w-[55%]">
            {CONTACT.deliveryConfigured && CONTACT.freeDeliveryThreshold > 0 ? `Free delivery across Pakistan on orders above ${formatPrice(CONTACT.freeDeliveryThreshold)}` : content.home.announcement}
          </p>
          <div className="hidden items-center gap-4 sm:flex">
            <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-primary">
              <Phone className="size-3.5" aria-hidden /> {CONTACT.phone}
            </a>
            {CONTACT.whatsapp && <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary"><MessageCircle className="size-3.5" aria-hidden /> WhatsApp</a>}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 min-w-0 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-page grid h-16 min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-3 xl:h-20 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:gap-5 2xl:gap-8">
          <Logo className="h-10 xl:h-14" />

          <nav aria-label="Main" className="hidden min-w-0 items-center gap-4 xl:flex 2xl:gap-6">
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
            <details className="group relative">
              <summary className="cursor-pointer list-none text-sm font-medium hover:text-primary">Categories <span aria-hidden>⌄</span></summary>
              <div className="absolute left-0 top-full z-50 mt-3 min-w-56 rounded-lg border border-border bg-card p-2 shadow-raised">
                {categories.map((c) => (
                  <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="block rounded px-3 py-2 text-sm hover:bg-secondary">{c.name}</Link>
                ))}
              </div>
            </details>
            <div className="ml-1 min-w-0 w-44 2xl:w-64">
              <SearchBox />
            </div>
          </nav>


          <div className="flex items-center">
            <button className="tap-target rounded-lg xl:hidden" aria-label="Search" aria-expanded={searchOpen} onClick={() => setSearchOpen((s) => !s)}>
              <Search className="size-5" />
            </button>
            <Link to="/wishlist" className="tap-target rounded-lg" aria-label="Wishlist">
              <Heart className="size-5" />
            </Link>
            <Link to="/cart" className="tap-target relative -mr-2 hidden rounded-lg sm:inline-flex" aria-label={`Cart, ${count} items`}>
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <span key={count} className="wow-cart-pop absolute right-1 top-1 grid min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4.5 text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
        {searchOpen && (
          <div className="container-page pb-3 xl:hidden">
            <SearchBox onDone={() => setSearchOpen(false)} />
          </div>
        )}
      </header>

      <nav aria-label="Mobile" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/98 pb-[env(safe-area-inset-bottom)] backdrop-blur xl:hidden">
        <Link to="/" activeOptions={{ exact: true }} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground data-[status=active]:text-primary">
          <Home className="size-5" aria-hidden />Home
        </Link>
        <Link to="/shop" className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground data-[status=active]:text-primary">
          <Grid2X2 className="size-5" aria-hidden />Shop
        </Link>
        <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search products" className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground">
          <Search className="size-5" aria-hidden />Search
        </button>
        <Link to="/cart" className="relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground data-[status=active]:text-primary">
          <ShoppingCart className="size-5" aria-hidden />Cart
          {count > 0 && <span key={count} className="wow-cart-pop absolute right-1/3 top-1 rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{count}</span>}
        </Link>
      </nav>
    </>
  );
}
