# Sweet Trade release checklist

This repository can be edited using GitHub directly. No Lovable prompt credits, GitHub Actions, or CLI workflows are required for code edits.

## Changes applied to the current Lovable Cloud project
Project: `14cceb1a-dc3e-4ba8-8195-2f8251f24ad8` (Sweet Trade).

On October 8, 2026, migrations `0001_secure_store.sql`, `0002_verify_product_prices.sql` and `0003_confirm_shipping.sql` were applied directly through the project's connected PostgreSQL database. Verification queries confirmed:
- 14 products, with the corrected product names.
- 0 verified product prices and 0 products available to order until the merchant confirms them.
- The existing admin role was retained and the first-user-admin escalation function is disabled.
- The shipping configuration is unconfirmed; checkout is blocked until the merchant confirms it.
- Previously seeded draft prices are retained in the administrator database, but not published as verified storefront prices.

These database changes are specific to this Lovable project, **not a proof that any external deployment database is migrated**.

## Required before a production launch
- On any different deployment/database, apply and verify `0001`, `0002` and `0003` against the verified project identity before release.
- Assign the first administrator only through a trusted, privileged process; public sign-up is disabled and no new account becomes admin automatically.
- Review and set the true prices, sizes, inventory, product gallery images and verified ingredients for all 14 products in admin.
- Confirm delivery fees and free-shipping threshold, if any, then enable the explicit delivery-confirmation checkbox in Admin → Settings. Configure only active payment methods.
- Confirm the business WhatsApp number before enabling WhatsApp ordering.
- Review the site's privacy, return and delivery copy with the business.
- Publish/deploy only after business details are verified. Confirm the production domain is actually mapped to this project and the latest GitHub commit.
- Run build, lint and browser E2E tests on the intended deployment; direct GitHub edits and Lovable database inspections do not replace these tests.

## Manual-browser QA matrix
- Desktop widths 1024 and 1440; mobile widths 320, 360, 390 and 430.
- Home: imagery, hero controls, categories, section links, all 14 product identities.
- Shop: query search, category filters, max price, stock filter, sort, empty state.
- Product: images, zoom dialog, size, availability, wishlist, sticky mobile Add to Cart above bottom navigation.
- Cart: add, increment, decrement, remove, persistence, totals, WhatsApp only when active.
- Checkout: Pakistani phone validation, all provinces, custom city/locality and address, unavailable payment methods, order failure, order success in a staging database only.
- Admin: authorization, product edit, archive/restore, categories, settings, order status; no public sign-up.
- Accessibility: keyboard navigation, focus states, dialogs, visible labels, touch targets.
- Verify no fake prices, reviews, badges, medical claims or unverified shipping promises remain.

**Never place real test orders on production.**

## Pakistan-wide checkout change (October 8, 2026)
- Sweet Trade serves customers throughout Pakistan, not only Karachi. City can be typed freely; province/region and locality are also required.
- The Lovable Cloud project's `orders` table now has nullable `province` and `city` columns; old records remain valid. For any other database, review and apply `docs/PAKISTAN_WIDE_CHECKOUT.sql` before deploying new checkout code.
- The editable suggested city list is under Admin → Settings → Website Content → Suggested cities; it does not restrict the actual delivery address.
- Delivery fees remain unverified (`delivery_configured=false` in the current Lovable project). Confirm *nationwide* rate applicability before enabling online checkout. Variable shipping charges by city/region will require further work; do not silently charge a Karachi fee for other cities.
- The site-wide hero subtitle was updated in the Lovable project from Karachi to Pakistan without modifying products, prices or order data.
- Browser E2E and build/lint are still required before treating the custom domain as released.

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

## Home/shop screenshot UI fixes — 9 October 2026
- The original logo pointed at a Lovable-only `/__l5e/assets-v1/...` URL and failed on the custom domain. Replaced it with a branded, accessible wordmark that never renders a broken image; a real logo uploaded through Admin → Settings → Website Content → Footer & trust is used when a public URL exists.
- Enlarged product cards and typography, made the selected-size price prominent, reduced repetitive "Estimated/From" language and removed pricing warnings from over the photos. The actual selected weight is still included in the order request.
- Made Add to Cart and Buy Now visible on every orderable product card and large enough for mobile use. Kept instant one-product Buy Now separate from the full saved cart.
- Changed homepage featured-product layout and shop listing grids to responsive one-to-four-column layouts rather than six cramped cards.
- Removed the duplicate footer trust strip from the home page, retaining it on other pages. Contact links for actual email/WhatsApp are clickable.
- The scaffold email `info@sweetrade.com` has **not been verified** by the merchant; hide this specific template value from customers until the admin enters an active inbox. The original database setting is not silently overwritten.
- 14 products still use shared category illustration images, not 14 real product photographs. These are now clearly labelled illustrative; Admin → Products highlights products needing authentic photography. **Replacing them with genuine, product-specific uploads remains a merchant asset dependency**.
- The default FAQ, delivery copy and terms now explain Pakistan-wide pending order requests, estimated prices and the requirement to confirm delivery charges before fulfillment.
- Source-only integration checks: 22 of 22 passed. This is not a substitute for a successful bundler build, responsive browser QA or a verified custom-domain deploy.
- No Lovable AI credits, GitHub Actions or local CLI were used.
