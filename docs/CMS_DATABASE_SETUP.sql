-- Sweet Trade: admin-editable storefront sections.
-- Applied to Lovable Cloud project 14cceb1a-dc3e-4ba8-8195-2f8251f24ad8 on 2026-10-08.
-- Safe to run on a separately verified deployment; never apply to unrelated databases.
CREATE TABLE IF NOT EXISTS public.site_content (
  section text PRIMARY KEY CHECK (section IN ('home','about','footer','faq','policies','checkout')),
  content jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(content) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.site_content FROM anon, authenticated;
GRANT SELECT ON TABLE public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE ON TABLE public.site_content TO authenticated;
GRANT ALL ON TABLE public.site_content TO service_role;

DROP POLICY IF EXISTS "Public read site content" ON public.site_content;
CREATE POLICY "Public read site content" ON public.site_content
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins insert site content" ON public.site_content;
CREATE POLICY "Admins insert site content" ON public.site_content
FOR INSERT TO authenticated WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

DROP POLICY IF EXISTS "Admins update site content" ON public.site_content;
CREATE POLICY "Admins update site content" ON public.site_content
FOR UPDATE TO authenticated USING (public.has_role((SELECT auth.uid()), 'admin'))
WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

INSERT INTO public.site_content(section, content)
SELECT section, '{}'::jsonb
FROM (VALUES ('home'),('about'),('footer'),('faq'),('policies'),('checkout')) AS rows(section)
ON CONFLICT (section) DO NOTHING;
