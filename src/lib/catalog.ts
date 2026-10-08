import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES as FALLBACK_CATEGORIES,
  CONTACT as FALLBACK_CONTACT,
  products as FALLBACK_PRODUCTS,
  type Product,
  type Variant,
} from "@/data/catalog";
import honey from "@/assets/p-honey.jpg";
import shilajit from "@/assets/p-shilajit.jpg";
import saffron from "@/assets/p-saffron.jpg";
import olive from "@/assets/p-olive.jpg";
import dates from "@/assets/p-dates.jpg";
import sweets from "@/assets/p-sweets.jpg";
import pickle from "@/assets/p-pickle.jpg";
import ghee from "@/assets/p-ghee.jpg";

export const LOCAL_IMAGES: Record<string, string> = { honey, shilajit, saffron, olive, dates, sweets, pickle, ghee };

/** DB stores either "local:<key>" (bundled image) or a full URL (uploaded). */
export const resolveImage = (v?: string | null) => {
  if (!v) return honey;
  if (v.startsWith("local:")) return LOCAL_IMAGES[v.slice(6)] ?? honey;
  return v;
};

export interface Category {
  slug: string;
  name: string;
  short: string;
  image: string;
  imageRaw: string | null;
  sortOrder: number;
}

export interface Settings {
  phone: string;
  whatsapp: string;
  email: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  heroTitle: string;
  heroSubtitle: string;
}

export interface Catalog {
  products: Product[];
  categories: Category[];
  settings: Settings;
}

const fallback = (): Catalog => ({
  products: FALLBACK_PRODUCTS,
  categories: FALLBACK_CATEGORIES.map((c, i) => ({ ...c, imageRaw: null, sortOrder: i })),
  settings: {
    ...FALLBACK_CONTACT,
    heroTitle: "Experience Nature's Finest",
    heroSubtitle:
      "Discover carefully selected natural products including honey, saffron, shilajit, olive oil, dates and traditional delicacies — delivered with care across Karachi.",
  },
});

export async function fetchCatalog(): Promise<Catalog> {
  const [p, c, s] = await Promise.all([
    supabase.from("products").select("*").order("sort_order").order("created_at"),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (p.error || c.error) {
    console.error("catalog load failed", p.error ?? c.error);
    return fallback();
  }
  const fb = fallback();
  return {
    categories: (c.data ?? []).map((x) => ({
      slug: x.slug,
      name: x.name,
      short: x.short || x.name,
      image: resolveImage(x.image_url),
      imageRaw: x.image_url,
      sortOrder: x.sort_order,
    })),
    products: (p.data ?? []).map((x) => {
      const image = resolveImage(x.image_url);
      const gallery = (x.gallery ?? []).map(resolveImage);
      return {
        id: x.id,
        slug: x.slug,
        name: x.name,
        category: (x.category_slug ?? "") as Product["category"],
        image,
        gallery: gallery.length ? gallery : [image],
        variants: (Array.isArray(x.variants) ? x.variants : []) as unknown as Variant[],
        inStock: x.in_stock,
        ...(x.badge ? { badge: x.badge as NonNullable<Product["badge"]> } : {}),
        featured: x.featured,
        short: x.short,
        description: x.description,
        ingredients: x.ingredients,
        storage: x.storage,
      };
    }),
    settings: s.data
      ? {
          phone: s.data.phone,
          whatsapp: s.data.whatsapp,
          email: s.data.email,
          deliveryFee: s.data.delivery_fee,
          freeDeliveryThreshold: s.data.free_delivery_threshold,
          heroTitle: s.data.hero_title,
          heroSubtitle: s.data.hero_subtitle || fb.settings.heroSubtitle,
        }
      : fb.settings,
  };
}

export const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: fetchCatalog, staleTime: 60_000 });

export function useCatalog() {
  const { data } = useSuspenseQuery(catalogQuery);
  return {
    ...data,
    contact: data.settings,
    findProduct: (slug: string) => data.products.find((x) => x.slug === slug),
    categoryOf: (slug: string) => data.categories.find((c) => c.slug === slug),
    countIn: (slug: string) => data.products.filter((x) => x.category === slug).length,
  };
}
