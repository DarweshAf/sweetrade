import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product, Variant } from "@/data/catalog";
import { useCatalog } from "@/lib/catalog";

export interface CartLine {
  productId: string;
  variant: string;
  qty: number;
}
export interface ResolvedLine extends CartLine {
  product: Product;
  v: Variant;
  total: number;
}

interface Store {
  /** Normal saved cart. A Buy Now selection remains separate from it. */
  lines: ResolvedLine[];
  checkoutLines: ResolvedLine[];
  checkoutSubtotal: number;
  checkoutDelivery: number;
  checkoutTotal: number;
  isBuyNow: boolean;
  ready: boolean;
  startBuyNow: (productId: string, variant: string, qty?: number) => void;
  clearBuyNow: () => void;
  completeCheckout: () => void;
  count: number;
  subtotal: number;
  delivery: number;
  total: number;
  add: (productId: string, variant: string, qty?: number) => void;
  setQty: (productId: string, variant: string, qty: number) => void;
  remove: (productId: string, variant: string) => void;
  clear: () => void;
  wishlist: string[];
  toggleWish: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);
const KEY = "st.cart.v1";
const WKEY = "st.wish.v1";
const BKEY = "st.buy-now.v1";

function safeLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 50).filter((item): item is CartLine =>
    typeof item === "object" && item !== null &&
    typeof item.productId === "string" &&
    typeof item.variant === "string" &&
    Number.isInteger(item.qty) && item.qty >= 1 && item.qty <= 99,
  );
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { products, contact: CONTACT } = useCatalog();
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [wishlist, setWish] = useState<string[]>([]);
  const [buyNowSelection, setBuyNowSelection] = useState<CartLine | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setRaw(safeLines(JSON.parse(localStorage.getItem(KEY) || "[]")));
      const wishes = JSON.parse(localStorage.getItem(WKEY) || "[]");
      setWish(Array.isArray(wishes) ? wishes.filter((id): id is string => typeof id === "string") : []);
      const pending = safeLines(JSON.parse(sessionStorage.getItem(BKEY) || "[]"));
      setBuyNowSelection(pending[0] ?? null);
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(raw));
  }, [raw, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem(WKEY, JSON.stringify(wishlist));
  }, [wishlist, ready]);
  useEffect(() => {
    if (ready) {
      if (buyNowSelection) sessionStorage.setItem(BKEY, JSON.stringify([buyNowSelection]));
      else sessionStorage.removeItem(BKEY);
    }
  }, [buyNowSelection, ready]);

  const value = useMemo<Store>(() => {
    const resolve = (items: CartLine[]) => items.flatMap<ResolvedLine>((l) => {
      const product = products.find((p) => p.id === l.productId);
      const v = product?.variants.find((x) => x.label === l.variant);
      return product?.inStock && v && v.price > 0 ? [{ ...l, product, v, total: v.price * l.qty }] : [];
    });
    const lines = resolve(raw);
    const checkoutLines = buyNowSelection ? resolve([buyNowSelection]) : lines;
    const subtotal = lines.reduce((n, l) => n + l.total, 0);
    const checkoutSubtotal = checkoutLines.reduce((n, l) => n + l.total, 0);
    const deliveryOf = (value: number) => value === 0 || (CONTACT.freeDeliveryThreshold > 0 && value >= CONTACT.freeDeliveryThreshold) ? 0 : CONTACT.deliveryFee;
    const delivery = deliveryOf(subtotal);
    const checkoutDelivery = deliveryOf(checkoutSubtotal);
    const same = (l: CartLine, id: string, v: string) => l.productId === id && l.variant === v;
    return {
      lines,
      checkoutLines,
      checkoutSubtotal,
      checkoutDelivery,
      checkoutTotal: checkoutSubtotal + checkoutDelivery,
      isBuyNow: Boolean(buyNowSelection),
      ready,
      startBuyNow: (productId, variant, qty = 1) => {
        if (products.some((p) => p.id === productId && p.inStock && p.variants.some((v) => v.label === variant && v.price > 0))) {
          setBuyNowSelection({ productId, variant, qty: Math.max(1, Math.min(99, Math.floor(qty))) });
        }
      },
      clearBuyNow: () => setBuyNowSelection(null),
      completeCheckout: () => {
        if (buyNowSelection) setBuyNowSelection(null);
        else setRaw([]);
      },
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal,
      delivery,
      total: subtotal + delivery,
      add: (id, v, qty = 1) =>
        setRaw((prev) =>
          prev.some((l) => same(l, id, v))
            ? prev.map((l) => (same(l, id, v) ? { ...l, qty: Math.min(99, l.qty + qty) } : l))
            : [...prev, { productId: id, variant: v, qty }],
        ),
      setQty: (id, v, qty) =>
        setRaw((prev) =>
          qty < 1 ? prev.filter((l) => !same(l, id, v)) : prev.map((l) => (same(l, id, v) ? { ...l, qty } : l)),
        ),
      remove: (id, v) => setRaw((prev) => prev.filter((l) => !same(l, id, v))),
      clear: () => setRaw([]),
      wishlist,
      toggleWish: (id) => setWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
    };
  }, [raw, wishlist, buyNowSelection, products, CONTACT, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside StoreProvider");
  return c;
}
