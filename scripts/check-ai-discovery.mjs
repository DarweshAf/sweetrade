import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function requireText(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(label + " is missing required text: " + needle);
  }
}

const robots = read("public/robots.txt");
const llms = read("public/llms.txt");
const llmsFull = read("public/llms-full.txt");
const sitemap = read("public/sitemap.xml");
const rootRoute = read("src/routes/__root.tsx");
const aiCatalog = read("src/routes/api.ai.catalog.ts");

requireText(robots, "User-agent: OAI-SearchBot", "robots.txt");
requireText(robots, "Allow: /api/ai/catalog", "robots.txt");
requireText(
  robots,
  "Sitemap: https://sweetrade.pk/sitemap.xml",
  "robots.txt",
);

requireText(llms, "https://sweetrade.pk/api/ai/catalog", "llms.txt");
requireText(llms, "https://sweetrade.pk/llms-full.txt", "llms.txt");
requireText(
  llmsFull,
  "Canonical domain: https://sweetrade.pk/",
  "llms-full.txt",
);
requireText(
  llmsFull,
  "Source-of-truth hierarchy",
  "llms-full.txt",
);

requireText(
  sitemap,
  "<loc>https://sweetrade.pk/</loc>",
  "sitemap.xml",
);
requireText(rootRoute, 'href: "/llms.txt"', "root AI discovery links");
requireText(
  rootRoute,
  'href: "/api/ai/catalog"',
  "root AI discovery links",
);
requireText(
  aiCatalog,
  'const BASE_URL = "https://sweetrade.pk"',
  "AI catalogue canonical origin",
);
requireText(
  aiCatalog,
  "priceVerified",
  "AI catalogue verified-price guard",
);

console.log("SweetTrade AI search / AEO discovery contract passed.");
