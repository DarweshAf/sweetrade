# SweeTrade — Mobile UI/UX audit and fixes

Date: 2026-10-09
Scope: SweeTrade.pk storefront and product administration (NOT Gulistan Naturals).
Branch: main.

## Issues fixed in source
- **Mixed-brand button styles:** The shared button component contained unrelated "Gulistan Naturals" theme variables (including unconfigured brass/easing). Replaced these with the existing SweeTrade theme and comfortable rounded buttons and mobile tap heights.
- **Header at narrow widths:** Changed its compact layout from a phantom 3-column grid to two real columns for logo/actions, while keeping three columns at xl desktop. The lower mobile navigation now correctly labels "Shop" instead of saying "Categories" for an all-products destination.
- **Search on mobile:** Larger input font to reduce iOS auto-zoom; search field closes after route navigation or when pressing Escape, and the lower search control toggles instead of becoming stuck.
- **Filter sheet:** Locks background scrolling while open; scrolls category/options within the panel, with a fixed safe-area-aware "Show products" button. Improved keyboard accessibility (initial focus, Escape, Tab containment, return focus) and radio/touch sizes.
- **Cart conversion:** Added a mobile-only persistent checkout bar above the bottom navigation, showing the correct estimated product subtotal when delivery is unconfirmed. Ordinary cart and Buy Now remain separate.
- **Checkout form:** 16px input size on mobile to avoid iOS zoom; safe min-width/rounded input fields; less cramped panels and first-invalid-field focus after validation errors. Preserves Pakistan-wide province/free-city entry and confirmed-only final pricing.
- **Keyboard overlay:** Hide the fixed mobile bottom navigation while the user types to avoid obscuring form controls.
- **Product detail whitespace:** Eliminated unused 192px padding at tablet sizes where the mobile purchase bar is not shown; retained space for the fixed purchase bar on narrow phones.
- **Admin Products:** Search/add actions now wrap and remain operable at 320px; edit dialog fits dynamic mobile viewport; admin inputs use 16px font to avoid Safari auto-zoom.
- Preserved SweeTrade (one-t spelling), sweetrade.pk domain, all configured products/variants and user-managed pricing.

## Verification
- 24/24 source integration checks passed for the implemented changes, mobile navigation/search, cart isolation, COD order acknowledgement and theme.
- No production database records, product prices, stock values or actual orders were modified.
- **Not verified:** full TypeScript/build, physical/browser viewport rendering on 320/360/390/768/1024px, actual keyboard appearance, production custom-domain deployment. The public URL could not be independently opened by the available page retrieval.
- Run a staging mobile E2E walkthrough after deployment: homepage/category swipe, shop filter sheet, price selection, Add to Cart and Buy Now, cart sticky action, city/address validation, COD request and admin price editing.
