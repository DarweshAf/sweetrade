import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "./ProductImage";
import { formatPrice, priceFrom, type Product } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function ProductCard({ product, showFrom = false }: { product: Product; showFrom?: boolean }) {
  const { add, wishlist, toggleWish } = useStore();
  const wished = wishlist.includes(product.id);
  const [selectedLabel, setSelectedLabel] = useState(product.variants[0]?.label ?? "");
  const selected = product.variants.find((variant) => variant.label === selectedLabel) ?? product.variants[0];
  const purchasable = Boolean(product.inStock && (product.priceVerified || product.requestOnly) && selected && selected.price > 0);
  const showStartingPrice = showFrom && selected?.label === product.variants[0]?.label
    && selected.price === priceFrom(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <div className="relative">
        <Link to="/product/$slug" params={{ slug: product.slug }} aria-label={product.name}>
          <ProductImage src={product.image} alt={product.name} ratio="1/1" zoom />
        </Link>
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-sm bg-ink px-2 py-0.5 text-[11px] font-semibold text-ink-foreground">
            {product.badge}
          </span>
        )}
        {!product.priceVerified ? (
          <span className="absolute bottom-2 left-2 rounded-sm bg-card/95 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            {product.requestOnly ? "Order request · price to confirm" : product.variants.some((v) => v.price > 0) ? "DEMO · Not for ordering" : "Price pending"}
          </span>
        ) : !product.inStock && (
          <span className="absolute bottom-2 left-2 rounded-sm bg-card/95 px-2 py-0.5 text-[11px] font-semibold text-destructive">
            Out of stock
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleWish(product.id)}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-card/95 shadow-card transition-colors hover:text-primary"
        >
          <Heart className={`size-4 ${wished ? "fill-primary text-primary" : ""}`} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight hover:text-primary">
          {product.name}
        </Link>
        <p className="mt-1 text-sm font-bold text-primary" aria-live="polite" aria-atomic="true">
          {selected && selected.price > 0 ? (
            <>
              {!product.priceVerified && <span className="mr-1 text-xs font-semibold text-muted-foreground">Estimated:</span>}
              {showStartingPrice && <span className="font-medium">From </span>}
              {formatPrice(selected.price)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">/ {selected.label}</span>
            </>
          ) : "Price on request"}
        </p>
        {product.variants.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={`Choose size for ${product.name}`}>
            {product.variants.map((variant) => (
              <button
                key={variant.label}
                type="button"
                onClick={() => setSelectedLabel(variant.label)}
                aria-pressed={selected?.label === variant.label}
                aria-label={`${product.name}, ${variant.label}`}
                className={`min-h-9 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${selected?.label === variant.label ? "border-primary bg-primary-soft text-primary" : "border-input hover:border-primary"}`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        )}
        {purchasable ? (
          <Button size="sm" className="mt-3 w-full" onClick={() => {
            if (!selected) return;
            add(product.id, selected.label);
            toast.success(`${product.name} (${selected.label}) ${product.requestOnly ? "added to your order request" : "added to cart"}`);
          }}>{product.requestOnly ? "Request Order" : "Add to Cart"} · {selected?.label}</Button>
        ) : product.priceVerified && selected?.price ? (
          <Button size="sm" className="mt-3 w-full" disabled>Out of Stock</Button>
        ) : (
          <Button asChild size="sm" variant="outline" className="mt-3 w-full">
            <Link to="/contact">{selected && selected.price > 0 ? "Confirm actual price" : "Enquire for Price"}</Link>
          </Button>
        )}
      </div>
    </article>
  );
}
