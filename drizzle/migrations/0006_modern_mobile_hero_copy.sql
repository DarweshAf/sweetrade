-- SweeTrade | modern, mobile-first hero copy (2026-10-09)
-- Safe and idempotent: change only the original default copy.
-- Do not overwrite text already customised by the merchant in Admin > Settings.
UPDATE public.site_settings
SET hero_title = 'Natural Favorites, Made Easy',
    hero_subtitle = 'Shop honey, saffron, shilajit, olive oil, dates and more. Choose your size and request an order from across Pakistan.',
    updated_at = now()
WHERE id = 1
  AND hero_title = 'Experience Nature''s Finest'
  AND hero_subtitle = 'Discover carefully selected natural products including honey, saffron, shilajit, olive oil, dates and traditional delicacies — available to customers across Pakistan.';
