# Sweet Trade release checklist

This repository can be edited using GitHub directly. No Lovable prompt credits, GitHub Actions, or CLI workflows are required for code edits.

## Required before a production launch
- Apply `drizzle/migrations/0001_secure_store.sql` to the **correct** Supabase database (the repo's `supabase/config.toml` project ID is authoritative). Do not run on a different project.
- Assign the first administrator only through a trusted, privileged process; public sign-up is disabled and no new account becomes admin automatically.
- Review and set the true prices, sizes, inventory, product gallery images and verified ingredients for all 14 products in admin.
- Confirm delivery fees and free-shipping threshold, if any. Configure only active payment methods.
- Confirm the business WhatsApp number before enabling WhatsApp ordering.
- Review the site's privacy, return and delivery copy with the business.
- Verify the production domain is deployed to this exact GitHub commit.
- Run build, lint and browser E2E tests on the intended deployment; these were not run by the direct GitHub editing workflow.

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
