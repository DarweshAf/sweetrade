import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "./ProductImage";
import { formatPrice, priceFrom, type Product } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function ProductCard({ product, showFrom = false }: { product: Product; showFrom?: boolean }) {
  const { add, wishlist, toggleWish } = useStore();
  const wished = wishlist.includes(product.id);
  const first = product.variants[0];

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
        {!product.inStock && (
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
        <p className="mt-1 text-sm font-bold text-primary">
          {showFrom && <span className="font-medium">From </span>}
          {formatPrice(showFrom ? priceFrom(product) : first.price)}
        </p>
        <Button
          size="sm"
          className="mt-3 w-full"
          disabled={!product.inStock}
          onClick={() => {
            add(product.id, first.label);
            toast.success(`${product.name} (${first.label}) added to cart`);
          }}
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </article>
  );
}
