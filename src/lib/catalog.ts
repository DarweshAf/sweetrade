import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SITE_CONTENT, mergeSiteContent, type SiteContent } from "@/lib/site-content";
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
import hero from "@/assets/hero.jpg";
import logo from "@/assets/sweetrade-logo.png.asset.json";

export const LOCAL_IMAGES: Record<string, string> = { honey, shilajit, saffron, olive, dates, sweets, pickle, ghee, hero, logo: logo.url };

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
  deliveryConfigured: boolean;
  pendingOrdersEnabled: boolean;
  freeDeliveryThreshold: number;
  paymentMethods: string[];
  heroTitle: string;
  heroSubtitle: string;
}

export interface Catalog {
  isPreview: boolean;
  requiresPricing: boolean;
  products: Product[];
  categories: Category[];
  settings: Settings;
  content: SiteContent;
}

const fallback = (): Catalog => ({
  isPreview: true,
  requiresPricing: true,
  content: DEFAULT_SITE_CONTENT,
  // Bundled products are a non-purchasable preview; never use demo prices for orders.
  products: FALLBACK_PRODUCTS.map((product) => ({ ...product, inStock: false, badge: undefined, variants: [{ label: "Contact for price", price: 0 }] })),
  categories: FALLBACK_CATEGORIES.map((c, i) => ({ ...c, imageRaw: null, sortOrder: i })),
  settings: {
    ...FALLBACK_CONTACT,
    paymentMethods: ["Cash on Delivery"],
    pendingOrdersEnabled: false,
    heroTitle: "Experience Nature's Finest",
    heroSubtitle:
      "Discover carefully selected natural products including honey, saffron, shilajit, olive oil, dates and traditional delicacies — available to customers across Pakistan.",
  },
});

export async function fetchCatalog(): Promise<Catalog> {
  const [p, c, s, site] = await Promise.all([
    supabase.from("products").select("*").order("sort_order").order("created_at"),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("site_content").select("section, content"),
  ]);
  if (p.error || c.error) {
    console.error("catalog load failed", p.error ?? c.error);
    return fallback();
  }
  if (!p.data?.length || !c.data?.length) return fallback();
  const fb = fallback();
  return {
    isPreview: false,
    content: site.error ? DEFAULT_SITE_CONTENT : mergeSiteContent(site.data ?? []),
    requiresPricing: (p.data ?? []).filter((x) => !x.is_archived).every((x) => !x.price_verified && !(s.data?.accept_pending_orders && x.allow_pending_orders)),
    categories: (c.data ?? []).map((x) => ({
      slug: x.slug,
      name: x.name,
      short: x.short || x.name,
      image: resolveImage(x.image_url),
      imageRaw: x.image_url,
      sortOrder: x.sort_order,
    })),
    products: (p.data ?? []).filter((x) => !x.is_archived).map((x) => {
      const image = resolveImage(x.image_url);
      const gallery = (x.gallery ?? []).map(resolveImage);
      return {
        id: x.id,
        slug: x.slug,
        name: x.name,
        category: (x.category_slug ?? "") as Product["category"],
        image,
        gallery: gallery.length ? gallery : [image],
        // Display admin-entered draft prices as clearly labelled demos in the UI.
        // Keep priceVerified=false and inStock=false until the merchant confirms the real rates.
        // Never substitute these demo numbers as checkout prices.
        variants: Array.isArray(x.variants) && x.variants.length
          ? (x.variants as unknown as Variant[]).filter((v) =>
              typeof v.label === "string" && v.label.trim().length > 0 &&
              typeof v.price === "number" && Number.isFinite(v.price) && v.price >= 0)
          : [{ label: "Contact for price", price: 0 }],
        priceVerified: x.price_verified,
        requestOnly: Boolean(s.data?.accept_pending_orders && x.allow_pending_orders && !(x.in_stock && x.price_verified)),
        inStock: (x.in_stock && x.price_verified) || Boolean(s.data?.accept_pending_orders && x.allow_pending_orders),
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
          deliveryConfigured: s.data.delivery_configured,
          pendingOrdersEnabled: s.data.accept_pending_orders,
          freeDeliveryThreshold: s.data.free_delivery_threshold,
          paymentMethods: s.data.payment_methods?.length ? s.data.payment_methods : ["Cash on Delivery"],
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
