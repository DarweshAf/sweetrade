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
