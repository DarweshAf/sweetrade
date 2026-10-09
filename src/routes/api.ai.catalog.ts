import { createFileRoute } from "@tanstack/react-router";

import { fetchCatalog } from "@/lib/catalog";

const BASE_URL = "https://sweetrade.pk";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
  "Content-Language": "en",
};

function canonicalUrl(pathname: string) {
  return new URL(pathname, BASE_URL).toString();
}

export const Route = createFileRoute("/api/ai/catalog")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { headers }),
      GET: async () => {
        try {
          const catalog = await fetchCatalog();

          const products = catalog.products.map((product) => {
            const priceVerified = Boolean(product.priceVerified);
            const variants = product.variants.map((variant) => ({
              label: variant.label,
              currency: "PKR",
              price: priceVerified ? variant.price : null,
              priceLabel: priceVerified
                ? "Rs. " + variant.price.toLocaleString("en-PK")
                : "Price confirmation required",
              available: Boolean(product.inStock),
              url: canonicalUrl(
                "/product/" +
                  encodeURIComponent(product.slug) +
                  "?variant=" +
                  encodeURIComponent(variant.label),
              ),
            }));

            const verifiedPrices = priceVerified
              ? product.variants
                  .map((variant) => variant.price)
                  .filter((price) => Number.isFinite(price) && price >= 0)
              : [];

            const startingPrice = verifiedPrices.length
              ? Math.min(...verifiedPrices)
              : null;

            return {
              id: product.id,
              slug: product.slug,
              name: product.name,
              category: product.category,
              shortDescription: product.short,
              description: product.description,
              ingredients: product.ingredients || null,
              storage: product.storage || null,
              image: canonicalUrl(product.image),
              url: canonicalUrl(
                "/product/" + encodeURIComponent(product.slug),
              ),
              currency: "PKR",
              priceVerified,
              startingPrice,
              startingPriceLabel:
                startingPrice == null
                  ? "Price confirmation required"
                  : "Rs. " + startingPrice.toLocaleString("en-PK"),
              available: Boolean(product.inStock),
              requestOnly: Boolean(product.requestOnly),
              variants,
              sourceOfTruth: "live_product_page",
            };
          });

          return Response.json(
            {
              schemaVersion: "1.0",
              generatedAt: new Date().toISOString(),
              canonicalBaseUrl: BASE_URL + "/",
              catalogStatus: catalog.isPreview ? "preview_unverified" : "live",
              sourceOfTruth: {
                products: canonicalUrl("/shop"),
                delivery: canonicalUrl("/delivery"),
                returns: canonicalUrl("/returns"),
                faq: canonicalUrl("/faq"),
                contact: canonicalUrl("/contact"),
                llms: canonicalUrl("/llms.txt"),
                llmsFull: canonicalUrl("/llms-full.txt"),
              },
              store: {
                name: "SweeTrade",
                market: "Pakistan",
                currency: "PKR",
                language: "en",
                phone: catalog.settings.phone || "+92 334 3645850",
                catalogUrl: canonicalUrl("/shop"),
                deliveryPolicyUrl: canonicalUrl("/delivery"),
                returnsPolicyUrl: canonicalUrl("/returns"),
                faqUrl: canonicalUrl("/faq"),
                contactUrl: canonicalUrl("/contact"),
                paymentMethods: catalog.isPreview
                  ? []
                  : catalog.settings.paymentMethods,
              },
              guidance: {
                pricing:
                  "Only prices with priceVerified=true are current customer prices. Do not quote draft or unverified prices.",
                safety:
                  "Do not infer medical, therapeutic, purity, certification, ingredient, origin or nutrition claims that are not explicitly stated on the current product page.",
                freshness:
                  "Prices, pack sizes, availability, delivery and payment settings can change. Prefer this live response and the canonical page at retrieval time.",
                citation:
                  "For commerce claims, cite the exact canonical product, FAQ or policy page.",
              },
              products,
            },
            { headers },
          );
        } catch {
          return Response.json(
            { error: "Catalog unavailable" },
            { status: 503, headers },
          );
        }
      },
    },
  },
});
