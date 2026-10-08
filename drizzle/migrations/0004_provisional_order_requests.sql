-- Sweet Trade — pending COD requests at temporary product prices.
-- Applied to Lovable Cloud project 14cceb1a-dc3e-4ba8-8195-2f8251f24ad8.
-- For other environments: review before applying to the correct store database.
-- No changes to price_verified or in_stock: these retain truthful merchant verification.
-- The server always recomputes prices, sets status pending, and refuses upfront payments.
-- In this mode, delivery is 0 in persisted totals ONLY as an unquoted placeholder;
-- shipping_pending=true and is_provisional=true distinguish it from free delivery.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS allow_pending_orders boolean NOT NULL DEFAULT false;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS accept_pending_orders boolean NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_provisional boolean NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_pending boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.price_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  it jsonb;
  p record;
  v jsonb;
  q int;
  unit_price int;
  out_items jsonb := '[]'::jsonb;
  sub bigint := 0;
  s record;
  any_unverified boolean := false;
  shipping_unconfirmed boolean;
  pending_allowed boolean;
BEGIN
  SELECT * INTO s FROM public.site_settings WHERE id = 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Store settings unavailable'; END IF;
  pending_allowed := coalesce(s.accept_pending_orders, false);
  shipping_unconfirmed := NOT coalesce(s.delivery_configured, false);

  IF jsonb_typeof(NEW.items) IS DISTINCT FROM 'array'
     OR jsonb_array_length(NEW.items) = 0
     OR jsonb_array_length(NEW.items) > 50 THEN
    RAISE EXCEPTION 'Order must contain 1 to 50 items';
  END IF;

  FOR it IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
    IF jsonb_typeof(it) IS DISTINCT FROM 'object' THEN
      RAISE EXCEPTION 'Invalid order item';
    END IF;
    SELECT * INTO p FROM public.products
    WHERE id = it->>'product_id' AND NOT coalesce(is_archived, false);
    IF NOT FOUND THEN RAISE EXCEPTION 'Product unavailable'; END IF;
    IF NOT (
      (p.in_stock AND p.price_verified)
      OR (pending_allowed AND p.allow_pending_orders)
    ) THEN
      RAISE EXCEPTION 'Product unavailable';
    END IF;

    SELECT x INTO v FROM jsonb_array_elements(p.variants) AS x
    WHERE x->>'label' = it->>'variant' LIMIT 1;
    IF v IS NULL THEN RAISE EXCEPTION 'Invalid variant'; END IF;
    IF coalesce(v->>'price', '') !~ '^[0-9]{1,9}$' THEN
      RAISE EXCEPTION 'Invalid product price';
    END IF;
    unit_price := (v->>'price')::int;
    IF unit_price <= 0 THEN RAISE EXCEPTION 'Product price unavailable'; END IF;

    IF coalesce(it->>'qty', '') !~ '^[0-9]{1,2}$' THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;
    q := (it->>'qty')::int;
    IF q < 1 OR q > 99 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;

    IF sub + (unit_price::bigint * q) > 2147483647 THEN
      RAISE EXCEPTION 'Order value too large';
    END IF;
    sub := sub + (unit_price::bigint * q);
    any_unverified := any_unverified
      OR NOT coalesce(p.price_verified, false)
      OR NOT coalesce(p.in_stock, false);
    out_items := out_items || jsonb_build_object(
      'product_id', p.id, 'name', p.name,
      'variant', v->>'label', 'price', unit_price, 'qty', q
    );
  END LOOP;

  IF shipping_unconfirmed AND NOT pending_allowed THEN
    RAISE EXCEPTION 'Delivery rates have not been confirmed';
  END IF;

  NEW.items := out_items;
  NEW.subtotal := sub;
  NEW.shipping_pending := shipping_unconfirmed;
  NEW.is_provisional := any_unverified OR shipping_unconfirmed;
  IF NEW.shipping_pending THEN
    NEW.delivery := 0;
  ELSE
    NEW.delivery := CASE
      WHEN s.free_delivery_threshold > 0 AND sub >= s.free_delivery_threshold
      THEN 0 ELSE greatest(coalesce(s.delivery_fee, 0), 0)
    END;
  END IF;
  IF sub > (2147483647 - NEW.delivery) THEN
    RAISE EXCEPTION 'Order value too large';
  END IF;
  NEW.total := sub + NEW.delivery;
  NEW.status := 'pending';
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.check_order_payment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  enabled text[];
  shipping_ready boolean;
  pending_allowed boolean;
BEGIN
  SELECT payment_methods, delivery_configured, accept_pending_orders
  INTO enabled, shipping_ready, pending_allowed
  FROM public.site_settings WHERE id = 1;
  IF enabled IS NULL OR NOT (NEW.payment_method = ANY(enabled)) THEN
    RAISE EXCEPTION 'Payment method is not available';
  END IF;
  IF NEW.is_provisional AND (
    NOT coalesce(pending_allowed, false)
    OR NEW.payment_method <> 'Cash on Delivery'
  ) THEN
    RAISE EXCEPTION 'Provisional orders must be requests confirmed by phone, with no upfront payment';
  END IF;
  IF NOT coalesce(shipping_ready, false) AND NOT
    (coalesce(pending_allowed, false) AND NEW.is_provisional) THEN
    RAISE EXCEPTION 'Delivery rates have not been confirmed';
  END IF;
  RETURN NEW;
END $function$;

-- Enable only merchant-approved seeded products, each with positive draft pricing.
UPDATE public.products
SET allow_pending_orders = true
WHERE id IN ('1','2','3','4','5','6','7','8','9','10','11','12','13','14')
  AND NOT coalesce(is_archived,false) AND NOT price_verified
  AND jsonb_typeof(variants)='array' AND jsonb_array_length(variants)>0
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(variants) AS v
    WHERE coalesce(v->>'price','') !~ '^[0-9]{1,9}$'
       OR (v->>'price')::int <= 0
  );

-- Requests are COD-only, with no online payment.
UPDATE public.site_settings
SET accept_pending_orders = true, updated_at = now()
WHERE id=1 AND 'Cash on Delivery'=ANY(payment_methods);
