/**
 * Safe storefront copy used until an administrator saves a replacement.
 * Every section is editable in Admin > Settings > Website Content.
 */
export interface Promo { title: string; sub: string; category: string; image: string }
export interface ShortFeature { title: string; body: string }
export interface QuestionAnswer { question: string; answer: string }

export interface SiteContent {
  home: {
    announcement: string;
    heroImage: string;
    highlights: ShortFeature[];
    promos: Promo[];
  };
  about: { eyebrow: string; title: string; introduction: string; detail: string; image: string };
  footer: {
    brandName: string; logoImage: string; tagline: string; description: string;
    trust: ShortFeature[];
    facebook: string; instagram: string;
  };
  faq: { items: QuestionAnswer[] };
  policies: { delivery: string; returns: string; privacy: string; terms: string };
  checkout: { cities: string[] };
}

export type SiteSection = keyof SiteContent;
export const SITE_SECTIONS: SiteSection[] = ["home", "about", "footer", "faq", "policies", "checkout"];

export const DEFAULT_SITE_CONTENT: SiteContent = {
  home: {
    announcement: "Natural products across Pakistan · Delivery details confirmed by location",
    heroImage: "local:hero",
    highlights: [
      { title: "Natural Products", body: "Explore our collection" },
      { title: "Carefully Selected", body: "Sourcing" },
      { title: "Pakistan-wide Service", body: "Confirm shipping for your city" },
      { title: "Easy Ordering", body: "Call or WhatsApp" },
    ],
    promos: [
      { title: "The Honey Collection", sub: "Discover our honey range.", category: "honey", image: "local:honey" },
      { title: "Shilajit Essentials", sub: "Explore our herbal collection.", category: "shilajit", image: "local:shilajit" },
      { title: "Dates & Dried Fruits", sub: "Explore dates and dried fruits.", category: "dates", image: "local:dates" },
    ],
  },
  about: {
    eyebrow: "A sweet way to trade",
    title: "Sweet Taste… Healthy Life",
    introduction: "Sweet Trade offers carefully selected natural products — honey, shilajit, saffron, olive oil, dates, pickles and traditional sweets — available to customers across Pakistan.",
    detail: "We keep things simple: clear product information, honest pricing and easy ordering by phone or WhatsApp.",
    image: "local:hero",
  },
  footer: {
    brandName: "Sweet Trade",
    logoImage: "",
    tagline: "Sweet Taste… Healthy Life",
    description: "Carefully selected natural products for customers across Pakistan.",
    facebook: "",
    instagram: "",
    trust: [
      { title: "Natural Selection", body: "Browse our collection" },
      { title: "Clear Product Information", body: "Know what you buy" },
      { title: "Customer Support", body: "Call for assistance" },
      { title: "Across Pakistan", body: "Ask about delivery to your city" },
      { title: "Here to Help", body: "We are here to help" },
    ],
  },
  faq: {
    items: [
      { question: "How do I order?", answer: "Browse the shop, select your product and size, add it to your cart and complete guest checkout." },
      { question: "Where do you deliver?", answer: "We serve customers across Pakistan. Enter your province, city and full address at checkout. Shipping availability and charges must be confirmed for your location." },
      { question: "How much is delivery?", answer: "Delivery charges depend on the destination. A checkout total is available only after the seller confirms their shipping settings. Contact us if your area needs a separate quote." },
      { question: "How can I confirm ingredients or availability?", answer: "Please contact our team before ordering if you need specific product information." },
      { question: "Do I need an account?", answer: "No. You can check out as a guest." },
    ],
  },
  policies: {
    delivery: "Sweet Trade serves customers throughout Pakistan. Delivery availability, charges and timing depend on the delivery city and address.\n\nReview the delivery fee and order total before placing an order. For a confirmed delivery estimate or an address requiring a separate quote, contact our team directly.\n\nDo not rely on a specific delivery date until it has been confirmed by our team.",
    returns: "If your order is damaged, incorrect or otherwise not as expected, please contact Sweet Trade as soon as possible with your order reference and relevant photos.\n\nOur team will review the issue and explain the options available for your product and circumstances. Product-specific return eligibility and procedures should be confirmed before sending an item back.\n\nThis page does not limit any rights that customers have under applicable law.",
    privacy: "When you place an order, Sweet Trade collects the information you provide, such as your name, phone number, province, city, locality, address, selected products and any order notes.\n\nThis information is used for managing the order, arranging delivery and communicating with you. Order information is stored in the store's database and is accessible to authorized administrators.\n\nIf you contact us through an external service such as WhatsApp, that service may process information according to its own privacy policy.\n\nFor questions about your order information or a request to review or correct it, please contact Sweet Trade. We will address requests in line with applicable law.",
    terms: "Sweet Trade is an online store serving customers across Pakistan. Product information, stock and delivery options may change.\n\nWhen you submit a checkout form, an order request is created. The order remains subject to confirmation, product availability and delivery feasibility. Our team may contact you to verify order details.\n\nThe cart and checkout display prices in Pakistani Rupees (PKR) and the applicable delivery fee. Contact us before ordering if you need confirmation of specifications, ingredients or availability.\n\nPayment and return arrangements depend on the confirmed order and applicable law. Please use the contact page if you have questions before ordering.",
  },
  checkout: {
    // Suggestions only — buyers can type any city in Pakistan.
    cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
      "Peshawar", "Quetta", "Hyderabad", "Sialkot", "Gujranwala", "Sukkur",
      "Abbottabad", "Bahawalpur", "Sargodha", "Mardan", "Muzaffarabad", "Gilgit", "Skardu", "Gwadar"],
  },
};

const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function sectionData<T extends object>(base: T, override: unknown): T {
  return object(override) ? { ...base, ...override } as T : base;
}

/** Admin-edited JSONB rows override defaults. Missing/malformed rows are harmless. */
export function mergeSiteContent(rows: { section: string; content: unknown }[]): SiteContent {
  const overrides = Object.fromEntries(rows.filter((r) => object(r.content)).map((r) => [r.section, r.content]));
  const home = sectionData(DEFAULT_SITE_CONTENT.home, overrides.home);
  const about = sectionData(DEFAULT_SITE_CONTENT.about, overrides.about);
  const footer = sectionData(DEFAULT_SITE_CONTENT.footer, overrides.footer);
  const faq = sectionData(DEFAULT_SITE_CONTENT.faq, overrides.faq);
  const policies = sectionData(DEFAULT_SITE_CONTENT.policies, overrides.policies);
  const checkout = sectionData(DEFAULT_SITE_CONTENT.checkout, overrides.checkout);
  return {
    home: {
      ...home,
      highlights: Array.isArray(home.highlights) ? home.highlights : DEFAULT_SITE_CONTENT.home.highlights,
      promos: Array.isArray(home.promos) ? home.promos : DEFAULT_SITE_CONTENT.home.promos,
    },
    about,
    footer: { ...footer, trust: Array.isArray(footer.trust) ? footer.trust : DEFAULT_SITE_CONTENT.footer.trust },
    faq: { items: Array.isArray(faq.items) ? faq.items : DEFAULT_SITE_CONTENT.faq.items },
    policies,
    checkout: { cities: Array.isArray(checkout.cities) ? checkout.cities.filter((x): x is string => typeof x === "string") : DEFAULT_SITE_CONTENT.checkout.cities },
  };
}
