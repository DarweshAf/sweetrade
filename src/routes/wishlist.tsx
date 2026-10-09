import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useCatalog } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — SweeTrade" }, { name: "description", content: "Browse your saved SweeTrade products." }] }),
  component: Wishlist,
});

function Wishlist() {
  const { products } = useCatalog();
  const { wishlist } = useStore();
  const saved = products.filter((product) => wishlist.includes(product.id));
  return <div className="container-page py-10 sm:py-14">
    <h1 className="text-3xl sm:text-4xl">Your Wishlist</h1>
    {saved.length ? (
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {saved.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    ) : (
      <div className="mx-auto mt-10 max-w-md rounded-lg border border-dashed border-border p-8 text-center">
        <Heart className="mx-auto size-9 text-muted-foreground" aria-hidden />
        <h2 className="mt-3 text-lg">Nothing saved yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Tap the heart on any product to save it here.</p>
        <Button asChild className="mt-5"><Link to="/shop">Browse Products</Link></Button>
      </div>
    )}
  </div>;
}
