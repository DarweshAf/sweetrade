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
