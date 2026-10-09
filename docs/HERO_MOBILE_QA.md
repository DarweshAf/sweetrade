# SweeTrade.pk — Mobile-first hero redesign (2026-10-09)

## Shipped source changes

- Replaced the legacy image-overlay hero with a modern editorial two-column hero on desktop and stacked text-then-image layout on mobile. Copy and CTAs never sit on top of visually busy photography on small screens.
- Clear product-focused headline: **Natural Favorites, Made Easy**.
- Short, honest description: **Shop honey, saffron, shilajit, olive oil, dates and more. Choose your size and request an order from across Pakistan.**
- Primary **Shop Products** goes to /shop, secondary **Browse Categories** navigates to the scroll-adjusted #categories section.
- Mobile CTA buttons become stacked below 380px and 2 columns when there is room; both use >=48px min height.
- On mobile, image is a fixed aspect-ratio rounded card below the hero text. On desktop, copy is on the left and a large photo on the right; no overlay-dependent text contrast.
- Responsive photo uses eager/high-priority image fetch and a `sizes` hint to avoid unnecessary lag and layout shifts.
- Hero still uses Admin > Settings > Hero headline and description, and Admin > Settings > Website Content > Homepage hero image. When merchant enters a comma, the second headline phrase is highlighted; arbitrary merchant titles without comma display normally.
- Updated only the exact original default hero title/description in the connected store database. Other custom merchant edits are preserved. The idempotent SQL copy update is also saved as `drizzle/migrations/0006_modern_mobile_hero_copy.sql`.
- Fixed header crowding around widths 1024–1279px by keeping mobile navigation until xl. The page bottom padding now matches that breakpoint; announcement height is flexible for wrapped Pakistan-wide text.
- Shortened the always-visible order confirmation disclaimer under the hero and ensured categories anchor does not hide underneath sticky header.

## Design and accessibility

- Honest ordering conditions remain visible: Pakistan-wide request submission is supported; final product prices and delivery charges are confirmed by phone, not falsely advertised as fixed or free.
- No external animation/video library was added. Existing CSS animations respect `prefers-reduced-motion`.
- Dynamic products, category counts, admin editing, cart and Buy Now paths are not altered.
- English text is retained for the Pakistan e-commerce storefront, and the brand/domain spellings are `SweeTrade` / `sweetrade.pk`.

## QA that still requires a real browser

1. At 320, 360 and 390px: headline is readable, does not overlay the image, both CTAs fit, and the header/announcement do not scroll sideways.
2. At 768, 1024, 1199, 1280 and 1440px: responsive split adapts, no clipped nav or duplicate mobile/desktop menus.
3. Click Shop Products and Browse Categories, including while the header is sticky.
4. Edit hero title/subtitle and hero image from Admin and verify live page reflects changes.
5. Check on low-end Android and slow networks: first image paint, no unexpected CLS, accessible tap targets.
6. Validate mobile Order Request and Buy Now end-to-end against a staging database; don't submit test customer orders on production.
7. Run a full build/lint and verify `sweetrade.pk` is serving the updated commit after deployment.

GitHub source checks are not a substitute for real browser E2E or a verified production build. No Lovable AI credits or GitHub Actions were used.
