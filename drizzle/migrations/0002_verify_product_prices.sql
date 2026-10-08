-- Product prices must be confirmed before public display and checkout.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS price_verified boolean NOT NULL DEFAULT false;

-- Recognize the initial demo records only. Preserve draft prices
-- in the database; keep products unavailable until verified by admin.
UPDATE public.products
SET in_stock = false,
    price_verified = false,
    badge = NULL,
    gallery = ARRAY[image_url],
    short = 'Contact Sweet Trade for confirmed product details and availability.',
    description = CASE WHEN description LIKE 'Our % is carefully sourced and packed to preserve its natural character.%' THEN '' ELSE description END,
    ingredients = CASE WHEN ingredients = '100% natural. No added preservatives or colours.' THEN '' ELSE ingredients END,
    storage = CASE WHEN storage = 'Store in a cool, dry place away from direct sunlight. Keep the lid tightly closed.' THEN '' ELSE storage END
WHERE id IN ('1','2','3','4','5','6','7','8','9','10','11','12','13','14')
  AND image_url LIKE 'local:%'
  AND short LIKE 'Carefully selected % with natural taste and quality.';

-- Replace known placeholder product identities only.
UPDATE public.products SET name='Salajix Drops', slug='salajix-drops'
WHERE id='4' AND name='Shilajit Vigour Drops' AND slug='shilajit-drops';
UPDATE public.products SET name='Zaitoon Oil (Olive Oil)'
WHERE id='7' AND name='Zaitoon Oil';
UPDATE public.products SET name='Crunch Max Rewri'
WHERE id='11' AND name='Crunch Max Revdi';
UPDATE public.products SET name='Mix Hyderabadi Achar (Mustard Oil)', slug='mix-hyderabadi-achar'
WHERE id='13' AND name='Mango Achaar' AND slug='mango-pickle';
UPDATE public.products SET name='Achar in Olive Oil', slug='achar-in-olive-oil',
  category_slug='pickles', image_url='local:pickle', gallery=ARRAY['local:pickle']
WHERE id='14' AND name='Naturally Pure Desi Ghee' AND slug='desi-ghee';

-- Server-side protection: no checkout-available item without approved prices.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_stock_requires_verified_price') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_stock_requires_verified_price
      CHECK (NOT in_stock OR price_verified);
  END IF;
END $$;
