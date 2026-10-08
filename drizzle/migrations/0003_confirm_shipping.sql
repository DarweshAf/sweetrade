-- Do not quote unverified Karachi delivery fees to customers or accept checkout until confirmed.
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS delivery_configured boolean NOT NULL DEFAULT false;

-- Enforce the checkout configuration server-side, including direct API inserts.
CREATE OR REPLACE FUNCTION public.check_order_payment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  enabled text[];
  shipping_ready boolean;
BEGIN
  SELECT payment_methods, delivery_configured INTO enabled, shipping_ready
  FROM public.site_settings WHERE id = 1;
  IF enabled IS NULL OR NOT (NEW.payment_method = ANY(enabled)) THEN
    RAISE EXCEPTION 'Payment method is not available';
  END IF;
  IF NOT coalesce(shipping_ready, false) THEN
    RAISE EXCEPTION 'Delivery rates have not been confirmed';
  END IF;
  RETURN NEW;
END $$;
