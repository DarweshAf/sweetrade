-- SweeTrade / https://sweetrade.pk
-- One-T brand spelling correction. Historical migrations are intentionally
-- preserved as applied; this file corrects their original seeded copy safely.
-- Idempotent: only the exact original default is changed.
UPDATE public.products
SET short = 'Contact SweeTrade for confirmed product details and availability.'
WHERE short = 'Contact Sweet Trade for confirmed product details and availability.';

-- Preserve custom marketing edits and business contacts. Existing empty
-- site_content sections use the corrected code defaults.
-- Do not replace an email with an unverified @sweetrade.pk mailbox.

-- Normalize only the original default store headline if an older seed still
-- references the previous two-word spelling. Do not change custom content.
UPDATE public.site_settings
SET hero_subtitle = replace(hero_subtitle, 'Sweet Trade', 'SweeTrade')
WHERE hero_subtitle = 'Explore Sweet Trade natural products in Karachi.';

-- Preserve custom brand names; correct only the old stock footer value.
UPDATE public.site_content
SET content = jsonb_set(content, '{brandName}', '"SweeTrade"'::jsonb)
WHERE section = 'footer'
  AND content->>'brandName' = 'Sweet Trade';
