import honey from "@/assets/p-honey.jpg";
import shilajit from "@/assets/p-shilajit.jpg";
import saffron from "@/assets/p-saffron.jpg";
import olive from "@/assets/p-olive.jpg";
import dates from "@/assets/p-dates.jpg";
import sweets from "@/assets/p-sweets.jpg";
import pickle from "@/assets/p-pickle.jpg";
import ghee from "@/assets/p-ghee.jpg";

/** Phase 1 (UI only): static catalog, shaped for a future database swap. */

export const CONTACT = {
  phone: "+92 334 3645850",
  whatsapp: "923343645850",
  email: "info@sweetrade.com",
  freeDeliveryThreshold: 3000,
  deliveryFee: 200,
};

export const CATEGORIES = [
  { slug: "honey", name: "Honey Collection", short: "Honey", image: honey },
  { slug: "shilajit", name: "Shilajit & Herbal", short: "Shilajit", image: shilajit },
  { slug: "saffron", name: "Premium Saffron", short: "Saffron", image: saffron },
  { slug: "olive-oil", name: "Olive Oil", short: "Olive Oil", image: olive },
  { slug: "dates", name: "Dates & Dried Fruits", short: "Dates", image: dates },
  { slug: "sweets", name: "Traditional Sweets", short: "Sweets", image: sweets },
  { slug: "pickles", name: "Pickles & Condiments", short: "Pickles", image: pickle },
] as const;
export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export interface Variant {
  label: string;
  price: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  image: string;
  gallery: string[];
  variants: Variant[];
  inStock: boolean;
  badge?: "Bestseller" | "New" | "Premium";
  featured?: boolean;
  short: string;
  description: string;
  ingredients: string;
  storage: string;
}

const w = (a: number, b: number, c: number): Variant[] => [
  { label: "250g", price: a },
  { label: "500g", price: b },
  { label: "1kg", price: c },
];

const p = (
  id: string,
  slug: string,
  name: string,
  category: CategorySlug,
  image: string,
  variants: Variant[],
  extra: Partial<Product> = {},
): Product => ({
  id,
  slug,
  name,
  category,
  image,
  gallery: [image],
  variants,
  inStock: true,
  short: `Discover ${name}. Contact us for product details and availability.`,
  description: `${name}. Please contact Sweet Trade for confirmed ingredients, origin, packaging and storage information.`,
  ingredients: "",
  storage: "",
  ...extra,
  badge: undefined, // Display promotional badges only when verified in the live catalog.
});

export const products: Product[] = [
  p("1", "robinia-honey", "Robinia Honey", "honey", honey, w(2000, 3600, 6000), { badge: "Bestseller", featured: true }),
  p("2", "organic-shilajit", "Salajeet (Shilajit)", "shilajit", shilajit, [{ label: "10g", price: 2500 }, { label: "20g", price: 4600 }, { label: "50g", price: 10000 }], { badge: "Bestseller", featured: true }),
  p("3", "premium-saffron", "Zaffran (Saffron)", "saffron", saffron, [{ label: "1g", price: 1200 }, { label: "3g", price: 3300 }, { label: "5g", price: 5200 }], { badge: "Premium", featured: true }),
  p("4", "shilajit-drops", "Salajix Drops", "shilajit", shilajit, [{ label: "30ml", price: 1800 }, { label: "60ml", price: 3400 }]),
  p("5", "dry-mix-honey", "Dry Mix Honey", "honey", honey, w(1800, 3300, 6200), { badge: "New", featured: true }),
  p("6", "zaitoon-honey", "Zaitoon Honey", "honey", honey, w(1900, 3500, 6500)),
  p("7", "zaitoon-oil", "Zaitoon Oil", "olive-oil", olive, [{ label: "250ml", price: 2200 }, { label: "500ml", price: 4000 }, { label: "1L", price: 7500 }], { featured: true }),
  p("8", "palosa-honey", "Palosa Honey", "honey", honey, w(1700, 3100, 5800)),
  p("9", "berry-honey", "Berry Honey", "honey", honey, w(1700, 3200, 6000), { inStock: false }),
  p("10", "dehydrated-fruits", "Dehydrated Fruits", "dates", dates, w(1500, 2800, 5200)),
  p("11", "crunch-max-revdi", "Crunch Max Revdi", "sweets", sweets, w(1200, 2200, 4000)),
  p("12", "saudi-dates", "Saudi Dates", "dates", dates, w(1500, 2800, 5000), { featured: true }),
  p("13", "mix-hyderabadi-achar", "Mix Hyderabadi Achar (Mustard Oil)", "pickles", pickle, [{ label: "500g", price: 900 }, { label: "1kg", price: 1600 }]),
  p("14", "achar-in-olive-oil", "Achar in Olive Oil", "pickles", pickle, [{ label: "500g", price: 900 }, { label: "1kg", price: 1600 }]),
];

export const formatPrice = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;
export const priceFrom = (p: Product) => Math.min(...p.variants.map((v) => v.price));
export const findProduct = (slug: string) => products.find((x) => x.slug === slug);
export const categoryOf = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const countIn = (slug: string) => products.filter((x) => x.category === slug).length;

export const KARACHI_AREAS = [
  "DHA", "Clifton", "Gulshan-e-Iqbal", "Gulistan-e-Jauhar", "North Nazimabad",
  "PECHS", "Bahadurabad", "Saddar", "Korangi", "Malir", "Federal B Area", "Nazimabad",
];

export const PAYMENT_METHODS = ["Cash on Delivery", "Bank Transfer", "JazzCash", "Easypaisa"] as const;
