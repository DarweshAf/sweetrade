import attarsImg from "@/assets/cat-attars.jpg";
import oilsImg from "@/assets/cat-oils.jpg";
import menImg from "@/assets/cat-men.jpg";
import womenImg from "@/assets/cat-women.jpg";
import unisexImg from "@/assets/cat-unisex.jpg";
import editorialImg from "@/assets/editorial-collection.jpg";

/**
 * Phase 1 is UI only. This module is the single source of catalog truth and is
 * shaped to be swapped for a database query later without touching components.
 */

export const SCENT_FAMILIES = [
  "Woody",
  "Oud",
  "Floral",
  "Fresh",
  "Sweet",
  "Spicy",
  "Musky",
  "Amber",
] as const;
export type ScentFamily = (typeof SCENT_FAMILIES)[number];

export const CATEGORIES = ["Attars", "Perfume Oils"] as const;
export type Category = (typeof CATEGORIES)[number];

export const GENDERS = ["Men", "Women", "Unisex"] as const;
export type Gender = (typeof GENDERS)[number];

export type Availability = "in_stock" | "low_stock" | "out_of_stock";

export interface Variant {
  id: string;
  label: string;
  ml: number;
  price: number;
  availability: Availability;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  descriptor: string;
  category: Category;
  gender: Gender;
  families: ScentFamily[];
  notes: { top: string[]; heart: string[]; base: string[] };
  variants: Variant[];
  image: string;
  badge?: "Best Seller" | "New" | "Sale";
  description: string;
  madeFor: string;
  whenToWear: string;
  performance: string;
  howToUse: string;
  bestSeller?: boolean;
  newArrival?: boolean;
  featured?: boolean;
  addedAt: string;
}

export const CURRENCY = "PKR";

export function formatPrice(value: number): string {
  return `Rs ${value.toLocaleString("en-PK")}`;
}

export function priceFrom(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}

export function productAvailability(product: Product): Availability {
  if (product.variants.every((v) => v.availability === "out_of_stock")) return "out_of_stock";
  if (product.variants.some((v) => v.availability === "in_stock")) return "in_stock";
  return "low_stock";
}

export const availabilityLabel: Record<Availability, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

const sizes = (
  rows: Array<[label: string, ml: number, price: number, availability?: Availability]>,
  prefix: string,
): Variant[] =>
  rows.map(([label, ml, price, availability = "in_stock"]) => ({
    id: `${prefix}-${ml}`,
    label,
    ml,
    price,
    availability,
  }));

export const products: Product[] = [
  {
    id: "p1",
    slug: "shahi-oud",
    name: "Shahi Oud",
    descriptor: "Smoky agarwood with dried rose",
    category: "Attars",
    gender: "Unisex",
    families: ["Oud", "Woody"],
    notes: {
      top: ["Saffron", "Dried rose"],
      heart: ["Agarwood", "Patchouli"],
      base: ["Sandalwood", "Amber"],
    },
    variants: sizes(
      [
        ["3 ml roll-on", 3, 1450],
        ["6 ml roll-on", 6, 2600],
        ["12 ml bottle", 12, 4800, "low_stock"],
      ],
      "p1",
    ),
    image: attarsImg,
    badge: "Best Seller",
    description:
      "A deep agarwood attar built around a dense, resinous heart. The opening is smoky and slightly medicinal, settling into dry rose and warm sandalwood on the skin.",
    madeFor: "Anyone drawn to traditional oud attars and heavier, resinous fragrance.",
    whenToWear: "Evenings, gatherings and cooler weather.",
    performance: "Concentrated oil. Projects close to the skin and stays noticeable for several hours.",
    howToUse: "Apply a small amount to pulse points. Do not rub in — let the oil settle.",
    bestSeller: true,
    featured: true,
    addedAt: "2026-02-10",
  },
  {
    id: "p2",
    slug: "gulistan-rose",
    name: "Gulistan Rose",
    descriptor: "Fresh Taif-style rose over soft musk",
    category: "Attars",
    gender: "Women",
    families: ["Floral", "Musky"],
    notes: {
      top: ["Rose petals", "Pink pepper"],
      heart: ["Rose absolute", "Geranium"],
      base: ["White musk", "Cedar"],
    },
    variants: sizes(
      [
        ["3 ml roll-on", 3, 1200],
        ["6 ml roll-on", 6, 2200],
        ["12 ml bottle", 12, 4100],
      ],
      "p2",
    ),
    image: womenImg,
    badge: "Best Seller",
    description:
      "A rose-forward attar kept bright rather than jammy. Clean musk in the base keeps it wearable through the day.",
    madeFor: "Those who want a recognisable, elegant rose without heaviness.",
    whenToWear: "Daytime, work and warm afternoons.",
    performance: "Moderate projection with a soft, lingering trail.",
    howToUse: "One or two dabs on the wrists and behind the ears.",
    bestSeller: true,
    addedAt: "2026-01-22",
  },
  {
    id: "p3",
    slug: "majmua-classic",
    name: "Majmua Classic",
    descriptor: "Herbal green blend with amber warmth",
    category: "Attars",
    gender: "Unisex",
    families: ["Woody", "Amber"],
    notes: {
      top: ["Basil", "Mint"],
      heart: ["Henna flower", "Vetiver"],
      base: ["Amber", "Musk"],
    },
    variants: sizes(
      [
        ["3 ml roll-on", 3, 950],
        ["6 ml roll-on", 6, 1750],
        ["12 ml bottle", 12, 3200],
      ],
      "p3",
    ),
    image: attarsImg,
    description:
      "A traditional majmua composition: green and herbal at first, then warm and powdery as it dries down.",
    madeFor: "Wearers who enjoy classic South Asian attar blends.",
    whenToWear: "All seasons, especially daytime.",
    performance: "Soft projection, long skin life.",
    howToUse: "Apply sparingly — the blend develops over the first hour.",
    addedAt: "2025-11-30",
  },
  {
    id: "p4",
    slug: "white-musk",
    name: "White Musk",
    descriptor: "Clean, skin-close musk",
    category: "Perfume Oils",
    gender: "Unisex",
    families: ["Musky", "Fresh"],
    notes: {
      top: ["Cotton accord"],
      heart: ["White musk", "Iris"],
      base: ["Soft woods"],
    },
    variants: sizes(
      [
        ["6 ml roll-on", 6, 1350],
        ["12 ml bottle", 12, 2400],
        ["30 ml bottle", 30, 5200],
      ],
      "p4",
    ),
    image: unisexImg,
    description:
      "A quiet, laundered musk oil. Useful on its own and as a base under heavier attars.",
    madeFor: "Anyone who prefers subtle fragrance or layering.",
    whenToWear: "Office, travel and everyday wear.",
    performance: "Low projection, very long wear.",
    howToUse: "Apply generously; layer under oud or rose for depth.",
    featured: true,
    addedAt: "2026-02-28",
  },
  {
    id: "p5",
    slug: "oud-mubakhar",
    name: "Oud Mubakhar",
    descriptor: "Incense-smoked oud and resins",
    category: "Attars",
    gender: "Men",
    families: ["Oud", "Spicy"],
    notes: {
      top: ["Frankincense", "Clove"],
      heart: ["Agarwood", "Leather"],
      base: ["Benzoin", "Tonka"],
    },
    variants: sizes(
      [
        ["3 ml roll-on", 3, 1850],
        ["6 ml roll-on", 6, 3400],
        ["12 ml bottle", 12, 6200, "out_of_stock"],
      ],
      "p5",
    ),
    image: menImg,
    description:
      "Built to echo bakhoor smoke: resin, spice and a dry leather edge over agarwood.",
    madeFor: "Those who like smoky, incense-driven fragrance.",
    whenToWear: "Night, winter and formal occasions.",
    performance: "Strong presence in the first hours, then a dry resinous base.",
    howToUse: "A single dab is usually enough.",
    bestSeller: true,
    addedAt: "2026-01-05",
  },
  {
    id: "p6",
    slug: "sandal-safed",
    name: "Sandal Safed",
    descriptor: "Creamy sandalwood, lightly sweet",
    category: "Attars",
    gender: "Unisex",
    families: ["Woody", "Sweet"],
    notes: {
      top: ["Coconut husk"],
      heart: ["Sandalwood"],
      base: ["Vanilla", "Soft amber"],
    },
    variants: sizes(
      [
        ["3 ml roll-on", 3, 1600],
        ["6 ml roll-on", 6, 2950],
        ["12 ml bottle", 12, 5400],
      ],
      "p6",
    ),
    image: attarsImg,
    description:
      "Sandalwood kept creamy and rounded, with just enough vanilla to soften the woody edge.",
    madeFor: "Lovers of smooth woods and comfort scents.",
    whenToWear: "Evenings and cooler days.",
    performance: "Medium projection, warm close-wear.",
    howToUse: "Apply to wrists and the back of the neck.",
    featured: true,
    addedAt: "2025-12-14",
  },
  {
    id: "p7",
    slug: "jannat-ul-firdaus",
    name: "Jannat-ul-Firdaus",
    descriptor: "Sweet floral amber, traditional profile",
    category: "Attars",
    gender: "Unisex",
    families: ["Sweet", "Amber", "Floral"],
    notes: {
      top: ["Honey", "Orange blossom"],
      heart: ["Jasmine", "Ylang-ylang"],
      base: ["Amber", "Balsam"],
    },
    variants: sizes(
      [
        ["3 ml roll-on", 3, 1100],
        ["6 ml roll-on", 6, 2000],
        ["12 ml bottle", 12, 3650],
      ],
      "p7",
    ),
    image: attarsImg,
    description:
      "A familiar, sweet attar profile — honeyed florals over a thick amber base.",
    madeFor: "Wearers who enjoy rich, sweet traditional blends.",
    whenToWear: "Evening gatherings and celebrations.",
    performance: "Noticeable projection with a long, sweet drydown.",
    howToUse: "Use sparingly; the sweetness builds.",
    addedAt: "2025-10-18",
  },
  {
    id: "p8",
    slug: "bahar-citrus",
    name: "Bahar Citrus",
    descriptor: "Bright bergamot and neroli",
    category: "Perfume Oils",
    gender: "Unisex",
    families: ["Fresh", "Floral"],
    notes: {
      top: ["Bergamot", "Lemon peel"],
      heart: ["Neroli", "Petitgrain"],
      base: ["Cedar", "Light musk"],
    },
    variants: sizes(
      [
        ["6 ml roll-on", 6, 1250],
        ["12 ml bottle", 12, 2250],
        ["30 ml bottle", 30, 4900],
      ],
      "p8",
    ),
    image: oilsImg,
    badge: "New",
    description:
      "A citrus oil kept clean and simple, with neroli giving it a little floral lift.",
    madeFor: "Hot-weather wear and people who dislike heavy fragrance.",
    whenToWear: "Mornings, summer and daily use.",
    performance: "Fresh opening; settles into a quiet woody musk.",
    howToUse: "Reapply through the day if you want the citrus to stay forward.",
    newArrival: true,
    addedAt: "2026-03-20",
  },
  {
    id: "p9",
    slug: "mitti-attar",
    name: "Mitti Attar",
    descriptor: "First rain on dry earth",
    category: "Attars",
    gender: "Unisex",
    families: ["Woody", "Fresh"],
    notes: {
      top: ["Wet clay accord"],
      heart: ["Vetiver", "Earth notes"],
      base: ["Sandalwood"],
    },
    variants: sizes(
      [
        ["3 ml roll-on", 3, 1700],
        ["6 ml roll-on", 6, 3100, "low_stock"],
      ],
      "p9",
    ),
    image: attarsImg,
    badge: "New",
    description:
      "An earthy attar in the mitti tradition — mineral and damp at first, then dry and woody.",
    madeFor: "Anyone looking for something unusual and non-sweet.",
    whenToWear: "Monsoon season, cool mornings.",
    performance: "Soft and intimate rather than loud.",
    howToUse: "Apply to wrists; works well layered with sandalwood.",
    newArrival: true,
    featured: true,
    addedAt: "2026-03-08",
  },
  {
    id: "p10",
    slug: "zafran-amber",
    name: "Zafran Amber",
    descriptor: "Saffron, honey and resin",
    category: "Perfume Oils",
    gender: "Men",
    families: ["Spicy", "Amber"],
    notes: {
      top: ["Saffron", "Nutmeg"],
      heart: ["Honey", "Labdanum"],
      base: ["Amber", "Oakmoss"],
    },
    variants: sizes(
      [
        ["6 ml roll-on", 6, 1950],
        ["12 ml bottle", 12, 3500],
        ["30 ml bottle", 30, 7600],
      ],
      "p10",
    ),
    image: menImg,
    description:
      "Spice-led and resinous, with saffron giving the opening a slightly leathery bite.",
    madeFor: "Wearers who like warm, spicy orientals.",
    whenToWear: "Winter evenings and formal wear.",
    performance: "Strong first hour, warm amber base afterwards.",
    howToUse: "One dab on each wrist.",
    addedAt: "2025-12-02",
  },
  {
    id: "p11",
    slug: "chameli-night",
    name: "Chameli Night",
    descriptor: "Night-blooming jasmine",
    category: "Attars",
    gender: "Women",
    families: ["Floral", "Sweet"],
    notes: {
      top: ["Green jasmine bud"],
      heart: ["Jasmine sambac", "Tuberose"],
      base: ["Sandalwood", "Musk"],
    },
    variants: sizes(
      [
        ["3 ml roll-on", 3, 1400],
        ["6 ml roll-on", 6, 2550],
        ["12 ml bottle", 12, 4650],
      ],
      "p11",
    ),
    image: womenImg,
    description:
      "A full, indolic jasmine attar with a soft sandalwood landing. Floral, not fruity.",
    madeFor: "People who want a true white-floral attar.",
    whenToWear: "Evenings and occasions.",
    performance: "Rich projection in the first hours.",
    howToUse: "Use one dab — jasmine builds quickly.",
    addedAt: "2025-11-11",
  },
  {
    id: "p12",
    slug: "musk-al-tahara",
    name: "Musk al Tahara",
    descriptor: "Powdery white musk, very soft",
    category: "Perfume Oils",
    gender: "Women",
    families: ["Musky", "Sweet"],
    notes: {
      top: ["Aldehydic powder"],
      heart: ["White musk"],
      base: ["Vanilla", "Cotton"],
    },
    variants: sizes(
      [
        ["6 ml roll-on", 6, 1150],
        ["12 ml bottle", 12, 2050],
        ["30 ml bottle", 30, 4400],
      ],
      "p12",
    ),
    image: oilsImg,
    description:
      "A gentle, powdery musk oil designed to sit very close to the skin.",
    madeFor: "Those who prefer barely-there fragrance.",
    whenToWear: "Everyday, any season.",
    performance: "Minimal projection, long wear.",
    howToUse: "Apply freely; pairs well with floral attars.",
    addedAt: "2025-09-28",
  },
  {
    id: "p13",
    slug: "cedar-leather",
    name: "Cedar & Leather",
    descriptor: "Dry cedar with a suede finish",
    category: "Perfume Oils",
    gender: "Men",
    families: ["Woody", "Spicy"],
    notes: {
      top: ["Black pepper", "Juniper"],
      heart: ["Cedarwood", "Suede"],
      base: ["Vetiver", "Tobacco leaf"],
    },
    variants: sizes(
      [
        ["6 ml roll-on", 6, 1750],
        ["12 ml bottle", 12, 3150],
        ["30 ml bottle", 30, 6800, "low_stock"],
      ],
      "p13",
    ),
    image: menImg,
    description:
      "A dry, structured woody oil. Peppery at the top, suede-smooth as it settles.",
    madeFor: "Everyday wear for people who dislike sweetness.",
    whenToWear: "Autumn and winter, day or night.",
    performance: "Medium projection, steady wear.",
    howToUse: "Two dabs; avoid layering with other woods.",
    addedAt: "2026-02-02",
  },
  {
    id: "p14",
    slug: "khus-vetiver",
    name: "Khus Vetiver",
    descriptor: "Cooling vetiver root",
    category: "Attars",
    gender: "Men",
    families: ["Fresh", "Woody"],
    notes: {
      top: ["Grapefruit peel"],
      heart: ["Khus root", "Vetiver"],
      base: ["Dry cedar"],
    },
    variants: sizes(
      [
        ["3 ml roll-on", 3, 1300],
        ["6 ml roll-on", 6, 2400],
      ],
      "p14",
    ),
    image: unisexImg,
    description:
      "A traditional khus attar — green, rooty and cooling, with a clean woody base.",
    madeFor: "Hot-weather wear and vetiver enthusiasts.",
    whenToWear: "Summer days.",
    performance: "Moderate projection, crisp drydown.",
    howToUse: "Apply to wrists and neck.",
    addedAt: "2026-01-14",
  },
  {
    id: "p15",
    slug: "amber-noir",
    name: "Amber Noir",
    descriptor: "Dark amber with tonka",
    category: "Perfume Oils",
    gender: "Unisex",
    families: ["Amber", "Sweet"],
    notes: {
      top: ["Cardamom"],
      heart: ["Amber", "Tonka bean"],
      base: ["Benzoin", "Vanilla"],
    },
    variants: sizes(
      [
        ["6 ml roll-on", 6, 1550],
        ["12 ml bottle", 12, 2800],
        ["30 ml bottle", 30, 6100],
      ],
      "p15",
    ),
    image: editorialImg,
    description:
      "A thick amber oil rounded with tonka and benzoin. Comforting and slightly gourmand.",
    madeFor: "Cold-weather wear and layering.",
    whenToWear: "Winter evenings.",
    performance: "Warm projection, very long base.",
    howToUse: "One dab; layer with oud for extra depth.",
    featured: true,
    addedAt: "2026-02-18",
  },
  {
    id: "p16",
    slug: "oud-rose-gift-pair",
    name: "Oud & Rose Pair",
    descriptor: "Two 6 ml attars, boxed",
    category: "Attars",
    gender: "Unisex",
    families: ["Oud", "Floral"],
    notes: {
      top: ["Rose", "Saffron"],
      heart: ["Agarwood", "Geranium"],
      base: ["Sandalwood", "Musk"],
    },
    variants: sizes([["2 × 6 ml set", 12, 4600]], "p16"),
    image: editorialImg,
    description:
      "Shahi Oud and Gulistan Rose in a single boxed pair, intended as a gift or an introduction to both styles.",
    madeFor: "Gifting, or trying the two signature profiles together.",
    whenToWear: "Either attar suits day or evening.",
    performance: "See the individual products for detail.",
    howToUse: "Wear separately, or layer a dab of each.",
    newArrival: true,
    addedAt: "2026-03-25",
  },
];

export const categoryCards = [
  {
    title: "Attars",
    href: "Attars" as Category,
    image: attarsImg,
    blurb: "Traditional concentrated oils",
  },
  {
    title: "Perfume Oils",
    href: "Perfume Oils" as Category,
    image: oilsImg,
    blurb: "Lighter, wearable blends",
  },
];

export const genderCards = [
  { title: "Men's Fragrances", gender: "Men" as Gender, image: menImg },
  { title: "Women's Fragrances", gender: "Women" as Gender, image: womenImg },
  { title: "Unisex Fragrances", gender: "Unisex" as Gender, image: unisexImg },
];

export const allSizeLabels = Array.from(
  new Set(products.flatMap((p) => p.variants.map((v) => v.label))),
).sort((a, b) => parseInt(a) - parseInt(b));

export function findProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) => {
    const haystack = [
      p.name,
      p.descriptor,
      p.category,
      p.gender,
      ...p.families,
      ...p.notes.top,
      ...p.notes.heart,
      ...p.notes.base,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export const brandValues = [
  {
    title: "Carefully selected fragrances",
    body: "Every blend is chosen and tested before it reaches the shelf.",
  },
  {
    title: "Long-lasting oils",
    body: "Concentrated oil formats designed to stay on the skin, not evaporate.",
  },
  {
    title: "Multiple sizes",
    body: "Roll-ons for trying, larger bottles once you know what you like.",
  },
  {
    title: "Secure shopping",
    body: "Clear pricing, clear policies and no account required to order.",
  },
];

export const shippingInfo =
  "Orders are dispatched within 1–2 working days. Delivery timelines are confirmed at checkout before payment.";

export const returnsInfo =
  "Unopened products can be returned within 7 days of delivery. For hygiene reasons, opened fragrance oils cannot be returned unless damaged in transit.";

export const productFaqs = [
  {
    q: "What is the difference between an attar and a perfume oil?",
    a: "Attars are traditional concentrated fragrance oils, usually heavier and longer-lasting. Our perfume oils are lighter blends intended for everyday wear.",
  },
  {
    q: "Do these contain alcohol?",
    a: "No. Everything in this range is an oil-based fragrance.",
  },
  {
    q: "How should I store my bottle?",
    a: "Keep it closed, away from direct sunlight and heat. Stored properly, the oil keeps its character for a long time.",
  },
  {
    q: "Can I layer two fragrances?",
    a: "Yes. Musk and sandalwood bases layer well under rose or oud.",
  },
];
