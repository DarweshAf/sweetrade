import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseUrl = "https://sweetrade.pk";
const catalogPath = path.join(root, "src/data/catalog.ts");
const catalogSource = fs.readFileSync(catalogPath, "utf8");

const corePaths = [
  "/",
  "/shop",
  "/about",
  "/faq",
  "/contact",
  "/delivery",
  "/returns",
  "/privacy",
  "/terms",
];

const urls = new Set(corePaths);
const lastModifiedByPath = new Map();

async function loadPublishedProducts() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !key) return [];

  try {
    const headers = { apikey: key };
    if (!key.startsWith("sb_")) {
      headers.Authorization = "Bearer " + key;
    }

    const response = await fetch(
      supabaseUrl.replace(/\/$/, "") +
        "/rest/v1/products?select=slug,updated_at&is_archived=eq.false&order=sort_order.asc,created_at.asc",
      { headers },
    );

    if (!response.ok) throw new Error("HTTP " + response.status);

    const rows = await response.json();
    return Array.isArray(rows)
      ? rows
          .map((row) => ({
            slug: String(row?.slug || "").trim(),
            updatedAt: row?.updated_at ? String(row.updated_at) : "",
          }))
          .filter((row) => Boolean(row.slug))
      : [];
  } catch (error) {
    console.warn(
      "Could not read live product slugs for sitemap; using bundled fallback.",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

const liveProducts = await loadPublishedProducts();

if (liveProducts.length) {
  for (const product of liveProducts) {
    const productPath = "/product/" + encodeURIComponent(product.slug);
    urls.add(productPath);

    if (product.updatedAt) {
      const parsed = new Date(product.updatedAt);
      if (!Number.isNaN(parsed.getTime())) {
        lastModifiedByPath.set(productPath, parsed.toISOString().slice(0, 10));
      }
    }
  }
} else {
  for (const match of catalogSource.matchAll(/p\(\s*"[^"]+"\s*,\s*"([^"]+)"/g)) {
    const slug = match[1]?.trim();
    if (slug) urls.add("/product/" + encodeURIComponent(slug));
  }
}

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const renderUrl = (pathname) => {
  const lastModified = lastModifiedByPath.get(pathname);
  return [
    "  <url>",
    "    <loc>" + escapeXml(baseUrl + pathname) + "</loc>",
    lastModified
      ? "    <lastmod>" + escapeXml(lastModified) + "</lastmod>"
      : "",
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
};

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  [...urls].sort().map(renderUrl).join("\n") +
  "\n</urlset>\n";

fs.writeFileSync(path.join(root, "public/sitemap.xml"), xml);
console.log("Generated sitemap.xml with", urls.size, "URLs");
