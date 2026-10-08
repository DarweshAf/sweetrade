import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CONTACT, products, type Product, type Variant } from "@/data/catalog";

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
  lines: ResolvedLine[];
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [wishlist, setWish] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setRaw(JSON.parse(localStorage.getItem(KEY) || "[]"));
      setWish(JSON.parse(localStorage.getItem(WKEY) || "[]"));
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

  const value = useMemo<Store>(() => {
    const lines = raw.flatMap<ResolvedLine>((l) => {
      const product = products.find((p) => p.id === l.productId);
      const v = product?.variants.find((x) => x.label === l.variant);
      return product && v ? [{ ...l, product, v, total: v.price * l.qty }] : [];
    });
    const subtotal = lines.reduce((n, l) => n + l.total, 0);
    const delivery = subtotal === 0 || subtotal >= CONTACT.freeDeliveryThreshold ? 0 : CONTACT.deliveryFee;
    const same = (l: CartLine, id: string, v: string) => l.productId === id && l.variant === v;
    return {
      lines,
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
  }, [raw, wishlist]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside StoreProvider");
  return c;
}
