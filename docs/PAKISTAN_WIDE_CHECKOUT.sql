-- SweeTrade: Pakistan-wide checkout address fields
-- Already applied to Lovable Cloud project 14cceb1a-dc3e-4ba8-8195-2f8251f24ad8.
-- Apply ONLY to any separately verified production DB before deploying the matching code.
-- Existing orders and their original area/address data remain intact.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS city text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_province_length_safe'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_province_length_safe
      CHECK (province IS NULL OR length(btrim(province)) BETWEEN 2 AND 80);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_city_length_safe'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_city_length_safe
      CHECK (city IS NULL OR length(btrim(city)) BETWEEN 2 AND 120);
  END IF;
END $$;

-- Legacy orders may have NULL city/province; admin will not infer or fabricate them.
-- New web checkout requires both fields. Leave delivery_configured=false until
-- the merchant verifies shipping rates and coverage for the areas it serves.

-- Correct only the known old Karachi-only seeded hero copy; never overwrite
-- any custom merchant marketing text.
UPDATE public.site_settings
SET hero_subtitle = CASE
  WHEN hero_subtitle = 'Explore SweeTrade natural products in Karachi.'
    THEN 'Explore SweeTrade natural products for customers across Pakistan.'
  WHEN hero_subtitle = 'Discover carefully selected natural products including honey, saffron, shilajit, olive oil, dates and traditional delicacies — delivered with care across Karachi.'
    THEN 'Discover carefully selected natural products including honey, saffron, shilajit, olive oil, dates and traditional delicacies — available to customers across Pakistan.'
  ELSE hero_subtitle
END
WHERE id = 1 AND hero_subtitle IN (
  'Explore SweeTrade natural products in Karachi.',
  'Discover carefully selected natural products including honey, saffron, shilajit, olive oil, dates and traditional delicacies — delivered with care across Karachi.'
);
