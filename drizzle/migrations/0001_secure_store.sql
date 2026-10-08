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
