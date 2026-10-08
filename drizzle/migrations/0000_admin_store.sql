CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- First signup becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(424242);
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_role AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Categories
CREATE TABLE public.categories (
  slug text PRIMARY KEY,
  name text NOT NULL,
  short text NOT NULL DEFAULT '',
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category_slug text REFERENCES public.categories(slug) ON UPDATE CASCADE ON DELETE SET NULL,
  image_url text,
  gallery text[] NOT NULL DEFAULT '{}',
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  in_stock boolean NOT NULL DEFAULT true,
  badge text,
  featured boolean NOT NULL DEFAULT false,
  short text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  ingredients text NOT NULL DEFAULT '',
  storage text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Site settings (single row)
CREATE TABLE public.site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  phone text NOT NULL DEFAULT '+92 334 3645850',
  whatsapp text NOT NULL DEFAULT '923343645850',
  email text NOT NULL DEFAULT 'info@sweetrade.com',
  delivery_fee int NOT NULL DEFAULT 200,
  free_delivery_threshold int NOT NULL DEFAULT 3000,
  hero_title text NOT NULL DEFAULT 'Experience Nature''s Finest',
  hero_subtitle text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders (guest checkout)
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number bigint GENERATED ALWAYS AS IDENTITY,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  area text NOT NULL,
  address text NOT NULL,
  notes text,
  payment_method text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal int NOT NULL DEFAULT 0,
  delivery int NOT NULL DEFAULT 0,
  total int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place order" ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND length(customer_name) BETWEEN 1 AND 120 AND length(address) BETWEEN 1 AND 500);
CREATE POLICY "Admins read orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Server-side price calculation so customers can't tamper with totals
CREATE OR REPLACE FUNCTION public.price_order()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  it jsonb; p record; v jsonb; q int; out_items jsonb := '[]'::jsonb; sub int := 0; s record;
BEGIN
  IF jsonb_typeof(NEW.items) <> 'array' OR jsonb_array_length(NEW.items) = 0 OR jsonb_array_length(NEW.items) > 50 THEN
    RAISE EXCEPTION 'Order must contain items';
  END IF;
  FOR it IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
    SELECT * INTO p FROM public.products WHERE id = it->>'product_id';
    IF NOT FOUND OR NOT p.in_stock THEN RAISE EXCEPTION 'Product unavailable'; END IF;
    SELECT x INTO v FROM jsonb_array_elements(p.variants) x WHERE x->>'label' = it->>'variant' LIMIT 1;
    IF v IS NULL THEN RAISE EXCEPTION 'Invalid variant'; END IF;
    q := greatest(1, least(99, coalesce((it->>'qty')::int, 1)));
    sub := sub + (v->>'price')::int * q;
    out_items := out_items || jsonb_build_object('product_id', p.id, 'name', p.name, 'variant', v->>'label', 'price', (v->>'price')::int, 'qty', q);
  END LOOP;
  SELECT * INTO s FROM public.site_settings WHERE id = 1;
  NEW.items := out_items;
  NEW.subtotal := sub;
  NEW.delivery := CASE WHEN sub >= coalesce(s.free_delivery_threshold, 3000) THEN 0 ELSE coalesce(s.delivery_fee, 200) END;
  NEW.total := sub + NEW.delivery;
  NEW.status := 'pending';
  RETURN NEW;
END $$;
CREATE TRIGGER orders_price BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.price_order();

-- Storage policies for product images bucket
CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins upload product images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update product images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete product images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));