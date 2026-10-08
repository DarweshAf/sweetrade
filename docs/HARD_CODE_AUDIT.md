# Sweet Trade — hardcoded vs admin-editable audit (2026-10-08)

Repository: DarweshAf/sweetrade, main. Lovable Cloud project ID: 14cceb1a-dc3e-4ba8-8195-2f8251f24ad8.
This document distinguishes implemented functionality from things that need live browser E2E verification.

## Already dynamic via Admin
- Products: names, descriptions, ingredients, storage details, galleries, featured flag, badge, archive, availability.
- Product weights/variants: independently editable size labels and PKR prices, confirmation safeguard; customer selects exact size on catalog and detail pages, cart uses the same label.
- Categories: create/edit/delete, image, short name, sort order.
- Orders: view customer orders and update statuses.
- Store Settings: phone, WhatsApp, email, delivery fee, delivery confirmation, free delivery threshold, accepted payment methods, homepage hero title and subtitle.

## Newly dynamic via Admin > Settings > Website Content
- Homepage: top announcement copy, hero background image, highlight messages, any number of promotion banners, each banner's image, title, subtitle and linked live category.
- About: heading, body text and image.
- Footer: brand name, uploaded logo, tagline, description, trust messages, optional social media links.
- FAQs: add, reorder manually through remove/add, edit and delete questions and answers.
- Legal/help pages: delivery, returns, privacy and terms paragraphs.
- Checkout: Pakistan-wide province/region selector, free-entry city and locality, optional postal code, and admin-editable city suggestions (not a restriction).

All of these use the RLS-protected site_content table. Default strings in src/lib/site-content.ts are non-destructive emergency fallbacks, not the only production source once merchant overrides exist. No invented prices are published.

## Still fixed on purpose / requiring a bigger feature
- Technical navigation and route URLs (Home, Shop, About, Contact, etc.) are fixed because every menu item needs a working route.
- Pakistan phone validation and PKR are business market rules. Province/region values are fixed geography; city suggestions are admin-managed and never prevent the buyer entering another Pakistan city.
- Payment provider choices (COD, Bank Transfer, JazzCash, Easypaisa) are code-validated; Admin can enable/disable supported ones but cannot safely invent a new payment integration.
- Order workflow status codes are a fixed set to preserve order processing and reporting.
- UI design tokens, fonts, accessibility behavior, and stock/price verification logic should remain controlled by code.

## Remaining genuine management gaps
- Page-by-page SEO titles/descriptions, OpenGraph image and site-wide structured data are still authored in route code.
- The footer/navigation page-menu structure is not a dynamic menu builder (link labels and pages are code-defined).
- Contact page is phone/email/WhatsApp only. No contact-message inbox or support ticket module exists.
- Wishlist is browser-local and not manageable per visitor from Admin.
- Store inventory currently uses a boolean in-stock flag, not numeric per-variant quantities, low-stock alerts or purchase-order workflows.
- Payment processors require verified credentials and separate secure integration before they can accept actual online payments.
- Coupon rules, promotions/discount engines, delivery zones with per-zone fees, taxes, staff permissions and content revision history are not implemented.
- The website favicon and page-level SEO are not yet dynamically managed. Store logo itself is editable.

## Safety and verification
- SQL table was added to this **specific** Lovable Cloud project directly with read access for anonymous visitors and write access limited by existing admin role RLS.
- On any *other* backend, review and apply docs/CMS_DATABASE_SETUP.sql to the verified target before using the new editor.
- Existing product pricing confirmation, shipping confirmation and order security triggers have not been changed.
- Data and RLS were inspected after DDL. Code was synced to GitHub via direct connector; no Lovable AI prompts, GitHub Actions, or CLI publishing was used.
- Full browser E2E, build and lint are still needed on the published/target environment; code checks alone are not a substitute.

## Pakistan-wide storefront correction (2026-10-08)
- Replaced Karachi-only store claims in header, product, metadata, default policies, FAQ, About and footer copy with Pakistan-wide positioning. Made the existing database hero subtitle nationwide without replacing any prices or orders.
- Added nullable city/province order columns and typed them; old orders are preserved and displayed without fabricated cities.
- Changed checkout from a Karachi-only city/area dropdown to a Pakistan-wide province picker, free-text city input with editable suggestions, neighbourhood/locality, full street address and optional postal code.
- No guessed nationwide delivery rates were activated. A flat store-wide delivery fee is only valid when explicitly confirmed for the destinations the merchant actually serves; variable-by-city rates are not implemented.
- See docs/PAKISTAN_WIDE_CHECKOUT.sql before deploying to another database.

## Provisional order requests — 8 October 2026
- Merchant authorised order requests at existing sample PKR prices. All 14 seeded products accept pending requests via `allow_pending_orders=true`; `price_verified=false` and `in_stock=false` remain truthful, unchanged.
- `site_settings.accept_pending_orders=true` opens the request path. Admin > Settings can disable it at any time; Admin > Products can disable each item separately.
- Shoppers choose weights, add to cart, enter a Pakistan address, acknowledge that estimated prices, availability and shipping are not final, and submit a **Cash on Delivery request**. There is **no upfront collection or automatic dispatch**.
- Orders are priced server-side from the active database variants; the trigger overrides client totals, forces `status=pending`, and records `is_provisional=true` and `shipping_pending=true` for unconfirmed shipping. A stored delivery value of 0 is **not a free shipping quote** when `shipping_pending=true`.
- Existing `delivery_configured=false` remains intact; no nationwide courier charge is invented. Final amounts require merchant/customer agreement before fulfillment.
- Admin > Orders displays provisional status and distinguishes estimated subtotals; dashboard excludes provisional requests from verified-price order value.
- Applied on the linked Lovable Cloud project, with a rollback-only trigger smoke test. The test left **zero** orders in the table.
- Schema/function replication for any separately deployed database: `drizzle/migrations/0004_provisional_order_requests.sql`. Do not apply to another project's database without verifying the target.
- Browser E2E, build/lint and custom-domain redeploy are still unverified. Lovable AI credits, GitHub Actions and CLI were not used.

## Instant Add to Cart / Buy Now and admin finalisation (8 October 2026)
- Shop, home featured cards, related products and product details expose direct **Add to Cart** and **Buy Now** actions. Weight/size selection drives displayed PKR price and order SKU variant.
- Buy Now enters checkout for **only** the selected product and quantity; existing saved cart is preserved separately. The one-item selection survives page reload within the browser tab. Cart → Checkout explicitly clears one-item Buy Now mode and uses the entire saved cart instead.
- Checkout reads its own selected items and totals, accepts Pakistan-wide addresses, and sends an order insert; server triggers recompute prices and enforce allowed draft or confirmed availability.
- Currently the linked DB has 14 provisional request-eligible products, COD only, and unconfirmed shipping, so these are **real saved pending order requests**, not automatic fulfillment, paid orders or binding shipping quotes.
- Admin → Orders allows manual entry of **confirmed unit prices per item**, **confirmed delivery fee** (including an explicitly entered zero for genuinely free delivery), and requires acknowledgement that the customer agreed before changing the order to Confirmed. Provisional requests cannot be marked shipped/delivered from the status selector.
- Previously stored order items keep their snapshot until explicitly confirmed; updating product prices in Admin → Products affects later orders, not existing stored requests.
- Buy Now from a product does not clear or silently purchase unrelated items in the cart; checkout offers a switch back to full-cart ordering.
- Two database transaction smoke tests (pending order insert, order finalisation) passed with intentional rollback; no test orders were left in the project database. Static code checks still need build/lint and real browser E2E; the public sweetrade.pk domain has **not** been confirmed deployed.
