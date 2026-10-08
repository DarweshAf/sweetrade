-- Apply before deploying code that uses these columns.
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END $$;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS payment_methods text[] NOT NULL DEFAULT ARRAY['Cash on Delivery']::text[];
ALTER TABLE public.site_settings ALTER COLUMN whatsapp SET DEFAULT '';
ALTER TABLE public.site_settings ALTER COLUMN free_delivery_threshold SET DEFAULT 0;
ALTER TABLE public.site_settings ALTER COLUMN delivery_fee SET DEFAULT 0;
-- Existing admins and settings remain unchanged. Initial admins require a trusted provisioner.

-- Reject payment methods not explicitly activated by the store administrator.
CREATE OR REPLACE FUNCTION public.check_order_payment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE enabled text[];
BEGIN
  SELECT payment_methods INTO enabled FROM public.site_settings WHERE id = 1;
  IF enabled IS NULL OR NOT (NEW.payment_method = ANY(enabled)) THEN
    RAISE EXCEPTION 'Payment method is not available';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS zz_check_order_payment ON public.orders;
CREATE TRIGGER zz_check_order_payment BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.check_order_payment();

-- Populate only a genuinely empty catalog. Prices and availability are intentionally unset.
-- Never replace existing merchant products or overwrite customer-supplied prices.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.products) THEN
    INSERT INTO public.categories (slug, name, short, image_url, sort_order) VALUES
      ('honey', 'Honey Collection', 'Honey Collection', 'local:honey', 0),
      ('shilajit', 'Shilajit & Herbal', 'Shilajit & Herbal', 'local:shilajit', 1),
      ('saffron', 'Premium Saffron', 'Premium Saffron', 'local:saffron', 2),
      ('olive-oil', 'Olive Oil', 'Olive Oil', 'local:olive', 3),
      ('dates', 'Dates & Dried Fruits', 'Dates & Dried Fruits', 'local:dates', 4),
      ('sweets', 'Traditional Sweets', 'Traditional Sweets', 'local:sweets', 5),
      ('pickles', 'Pickles & Condiments', 'Pickles & Condiments', 'local:pickle', 6)
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO public.products (slug, name, category_slug, image_url, gallery, variants, in_stock, sort_order, short) VALUES
      ('robinia-honey', 'Robinia Honey', 'honey', 'local:honey', ARRAY['local:honey'], '[]'::jsonb, false, 0, 'Contact us for product details and availability.'),
      ('salajeet', 'Salajeet (Shilajit)', 'shilajit', 'local:shilajit', ARRAY['local:shilajit'], '[]'::jsonb, false, 1, 'Contact us for product details and availability.'),
      ('zaffran', 'Zaffran (Saffron)', 'saffron', 'local:saffron', ARRAY['local:saffron'], '[]'::jsonb, false, 2, 'Contact us for product details and availability.'),
      ('salajix-drops', 'Salajix Drops', 'shilajit', 'local:shilajit', ARRAY['local:shilajit'], '[]'::jsonb, false, 3, 'Contact us for product details and availability.'),
      ('dry-mix-honey', 'Dry Mix Honey', 'honey', 'local:honey', ARRAY['local:honey'], '[]'::jsonb, false, 4, 'Contact us for product details and availability.'),
      ('zaitoon-honey', 'Zaitoon Honey', 'honey', 'local:honey', ARRAY['local:honey'], '[]'::jsonb, false, 5, 'Contact us for product details and availability.'),
      ('zaitoon-oil', 'Zaitoon Oil (Olive Oil)', 'olive-oil', 'local:olive', ARRAY['local:olive'], '[]'::jsonb, false, 6, 'Contact us for product details and availability.'),
      ('palosa-honey', 'Palosa Honey', 'honey', 'local:honey', ARRAY['local:honey'], '[]'::jsonb, false, 7, 'Contact us for product details and availability.'),
      ('berry-honey', 'Berry Honey', 'honey', 'local:honey', ARRAY['local:honey'], '[]'::jsonb, false, 8, 'Contact us for product details and availability.'),
      ('dehydrated-fruits', 'Dehydrated Fruits', 'dates', 'local:dates', ARRAY['local:dates'], '[]'::jsonb, false, 9, 'Contact us for product details and availability.'),
      ('crunch-max-rewri', 'Crunch Max Rewri', 'sweets', 'local:sweets', ARRAY['local:sweets'], '[]'::jsonb, false, 10, 'Contact us for product details and availability.'),
      ('saudi-dates', 'Saudi Dates', 'dates', 'local:dates', ARRAY['local:dates'], '[]'::jsonb, false, 11, 'Contact us for product details and availability.'),
      ('mix-hyderabadi-achar', 'Mix Hyderabadi Achar (Mustard Oil)', 'pickles', 'local:pickle', ARRAY['local:pickle'], '[]'::jsonb, false, 12, 'Contact us for product details and availability.'),
      ('achar-in-olive-oil', 'Achar in Olive Oil', 'pickles', 'local:pickle', ARRAY['local:pickle'], '[]'::jsonb, false, 13, 'Contact us for product details and availability.')
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;
