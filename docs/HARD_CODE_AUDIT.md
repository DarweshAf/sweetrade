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
- Checkout: editable list of Karachi delivery areas, one per line.

All of these use the RLS-protected site_content table. Default strings in src/lib/site-content.ts are non-destructive emergency fallbacks, not the only production source once merchant overrides exist. No invented prices are published.

## Still fixed on purpose / requiring a bigger feature
- Technical navigation and route URLs (Home, Shop, About, Contact, etc.) are fixed because every menu item needs a working route.
- Karachi-only city, Pakistan phone validation and PKR are business market rules. Areas within Karachi can be managed.
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
