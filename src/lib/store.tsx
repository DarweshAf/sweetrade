import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products, type Product, type Variant } from "@/data/catalog";

export interface CartLine {
  productId: string;
  variantId: string;
  qty: number;
}

export interface ResolvedLine extends CartLine {
  product: Product;
  variant: Variant;
  lineTotal: number;
}

interface StoreValue {
  hydrated: boolean;
  lines: CartLine[];
  resolved: ResolvedLine[];
  count: number;
  subtotal: number;
  addToCart: (productId: string, variantId: string, qty?: number) => void;
  setQty: (productId: string, variantId: string, qty: number) => void;
  removeLine: (productId: string, variantId: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  recentlyViewed: string[];
  markViewed: (productId: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const CART_KEY = "gn.cart.v1";
const WISH_KEY = "gn.wishlist.v1";
const VIEWED_KEY = "gn.viewed.v1";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setLines(read<CartLine[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISH_KEY, []));
    setRecentlyViewed(read<string[]>(VIEWED_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(VIEWED_KEY, JSON.stringify(recentlyViewed));
  }, [recentlyViewed, hydrated]);

  const addToCart = useCallback((productId: string, variantId: string, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.productId === productId && l.variantId === variantId);
      if (i === -1) return [...prev, { productId, variantId, qty }];
      const next = [...prev];
      next[i] = { ...next[i], qty: Math.min(99, next[i].qty + qty) };
      return next;
    });
  }, []);

  const setQty = useCallback((productId: string, variantId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.productId === productId && l.variantId === variantId))
        : prev.map((l) =>
            l.productId === productId && l.variantId === variantId
              ? { ...l, qty: Math.min(99, qty) }
              : l,
          ),
    );
  }, []);

  const removeLine = useCallback((productId: string, variantId: string) => {
    setLines((prev) => prev.filter((l) => !(l.productId === productId && l.variantId === variantId)));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);

  const markViewed = useCallback((productId: string) => {
    setRecentlyViewed((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 8));
  }, []);

  const resolved = useMemo(() => {
    return lines.flatMap<ResolvedLine>((line) => {
      const product = products.find((p) => p.id === line.productId);
      const variant = product?.variants.find((v) => v.id === line.variantId);
      if (!product || !variant) return [];
      return [{ ...line, product, variant, lineTotal: variant.price * line.qty }];
    });
  }, [lines]);

  const value = useMemo<StoreValue>(
    () => ({
      hydrated,
      lines,
      resolved,
      count: resolved.reduce((n, l) => n + l.qty, 0),
      subtotal: resolved.reduce((n, l) => n + l.lineTotal, 0),
      addToCart,
      setQty,
      removeLine,
      clearCart,
      cartOpen,
      setCartOpen,
      wishlist,
      toggleWishlist,
      isWishlisted: (id: string) => wishlist.includes(id),
      recentlyViewed,
      markViewed,
    }),
    [
      hydrated,
      lines,
      resolved,
      addToCart,
      setQty,
      removeLine,
      clearCart,
      cartOpen,
      wishlist,
      toggleWishlist,
      recentlyViewed,
      markViewed,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
