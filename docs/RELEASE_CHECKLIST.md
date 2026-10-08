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
- Checkout: Pakistani phone validation, Karachi area, unavailable payment methods, order failure, order success in a staging database only.
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
