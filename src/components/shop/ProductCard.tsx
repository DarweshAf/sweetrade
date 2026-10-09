import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "./ProductImage";
import { formatPrice, type Product } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

/** Compact, readable shopping card for mobile, tablet and large screens. */
export function ProductCard({ product }: { product: Product; showFrom?: boolean }) {
  const { add, startBuyNow, wishlist, toggleWish } = useStore();
  const navigate = useNavigate();
  const wished = wishlist.includes(product.id);
  const [selectedLabel, setSelectedLabel] = useState(product.variants[0]?.label ?? "");
  const selected = product.variants.find((v) => v.label === selectedLabel) ?? product.variants[0];
  const canOrder = Boolean(product.inStock && (product.priceVerified || product.requestOnly) && selected && selected.price > 0);
  const hasEstimate = !product.priceVerified && Boolean(selected?.price);

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-raised">
      <div className="relative">
        <Link to="/product/$slug" params={{ slug: product.slug }} aria-label={`View ${product.name}`}>
          <ProductImage
            src={product.image}
            alt={product.imageIllustrative ? `Illustrative category photo for ${product.name}` : product.name}
            ratio="1/1"
            sizes="(max-width: 440px) 95vw, (max-width: 800px) 46vw, (max-width: 1280px) 32vw, 24vw"
            zoom
          />
        </Link>
        {product.imageIllustrative && (
          <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] rounded-md bg-card/95 px-2 py-1 text-[11px] font-medium text-foreground shadow-card">
            Illustrative photo
          </span>
        )}
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-md bg-ink px-2 py-1 text-xs font-semibold text-ink-foreground">
            {product.badge}
          </span>
        )}
        <button type="button" onClick={() => toggleWish(product.id)}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute right-2 top-2 grid size-10 place-items-center rounded-full bg-card/95 shadow-card transition-colors hover:text-primary">
          <Heart className={`size-5 ${wished ? "fill-primary text-primary" : ""}`} aria-hidden />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link to="/product/$slug" params={{ slug: product.slug }}
          className="line-clamp-2 min-h-11 text-base font-semibold leading-snug text-foreground hover:text-primary">
          {product.name}
        </Link>

        <div aria-live="polite" aria-atomic="true" className="space-y-0.5">
          <p className="text-xl font-bold leading-tight text-primary tabular-nums sm:text-2xl">
            {selected && selected.price > 0 ? formatPrice(selected.price) : "Price on request"}
          </p>
          <p className="text-sm text-muted-foreground">
            {selected?.label ?? "Select size"}{hasEstimate ? " · Estimated, final price confirmed by phone" : ""}
          </p>
        </div>

        {product.variants.length > 1 && (
          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-foreground">Select weight / size</legend>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button key={variant.label} type="button"
                  onClick={() => setSelectedLabel(variant.label)}
                  aria-pressed={selected?.label === variant.label}
                  aria-label={`${product.name}, ${variant.label}, ${formatPrice(variant.price)}`}
                  className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${selected?.label === variant.label
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-input bg-background text-foreground hover:border-primary"}`}>
                  {variant.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {canOrder ? (
          <div className="mt-auto grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
            <Button type="button" variant="outline" className="h-auto min-h-11 min-w-0 gap-1 px-2 text-xs font-semibold sm:text-sm"
              onClick={() => {
                if (!selected) return;
                add(product.id, selected.label);
                toast.success(`${product.name} (${selected.label}) added to cart`, {
                  action: { label: "View Cart", onClick: () => navigate({ to: "/cart" }) },
                });
              }}>
              <ShoppingCart className="size-4 shrink-0" aria-hidden /> <span>Add to Cart</span>
            </Button>
            <Button type="button" className="h-auto min-h-11 min-w-0 gap-1 px-2 text-xs font-semibold sm:text-sm"
              onClick={() => {
                if (!selected) return;
                startBuyNow(product.id, selected.label);
                navigate({ to: "/checkout" });
              }}>
              <ShoppingBag className="size-4 shrink-0" aria-hidden /> <span>Buy Now</span>
            </Button>
          </div>
        ) : (
          <Button asChild variant="outline" className="mt-auto min-h-11 w-full">
            <Link to="/contact">{product.priceVerified ? "Check availability" : "Ask for price"}</Link>
          </Button>
        )}
      </div>
    </article>
  );
}
