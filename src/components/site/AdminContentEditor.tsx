import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { resolveImage, useCatalog } from "@/lib/catalog";
import type { SiteContent, SiteSection, QuestionAnswer, Promo, ShortFeature } from "@/lib/site-content";
import { uploadImage } from "@/lib/admin";
import { Button } from "@/components/ui/button";

const SECTIONS: { key: SiteSection; label: string }[] = [
  { key: "home", label: "Homepage" },
  { key: "about", label: "About" },
  { key: "footer", label: "Footer & trust" },
  { key: "faq", label: "FAQs" },
  { key: "policies", label: "Policies" },
  { key: "checkout", label: "Delivery areas" },
];
const fieldClass = "min-h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none";
const multiline = fieldClass + " min-h-24 resize-y";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1.5"><span className="block text-sm font-medium">{label}</span>{children}</label>;
}
function Text({ label, value, onChange, rows }: { label: string; value: string; onChange: (s: string) => void; rows?: number }) {
  return <Field label={label}>{rows
    ? <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className={multiline} />
    : <input value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
  }</Field>;
}
function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (s: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const upload = async (f?: File) => {
    if (!f) return;
    setUploading(true);
    try {
      onChange(await uploadImage(f));
      toast.success("Image uploaded. Save the section to publish it.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };
  return <div className="space-y-2">
    <span className="text-sm font-medium">{label}</span>
    <div className="flex flex-wrap items-center gap-3">
      <img src={resolveImage(value)} alt="" className="h-20 w-28 rounded-md border border-border object-cover" />
      <input aria-label={label} type="file" accept="image/*" disabled={uploading}
        onChange={(e) => { void upload(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }}
        className="max-w-full text-xs" />
    </div>
    {uploading && <p role="status" className="text-xs text-muted-foreground">Uploading image…</p>}
  </div>;
}
export function AdminContentEditor() {
  const { content, categories, isPreview } = useCatalog();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<SiteSection>("home");
  const [draft, setDraft] = useState<SiteContent>(content);
  const [busy, setBusy] = useState(false);
  useEffect(() => setDraft(content), [content]);

  const update = <K extends SiteSection>(key: K, patch: Partial<SiteContent[K]>) => {
    setDraft((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };
  const updateFeature = (section: "home" | "footer", index: number, patch: Partial<ShortFeature>) => {
    const key = section === "home" ? "highlights" : "trust";
    const items = draft[section][key].map((f, i) => i === index ? { ...f, ...patch } : f);
    if (section === "home") update("home", { highlights: items });
    else update("footer", { trust: items });
  };
  const updatePromo = (index: number, patch: Partial<Promo>) =>
    update("home", { promos: draft.home.promos.map((v, i) => i === index ? { ...v, ...patch } : v) });
  const updateFaq = (index: number, patch: Partial<QuestionAnswer>) =>
    update("faq", { items: draft.faq.items.map((v, i) => i === index ? { ...v, ...patch } : v) });
  const save = async () => {
    if (busy) return;
    if (selected === "checkout" && !draft.checkout.areas.length) {
      toast.error("Add at least one delivery area."); return;
    }
    if (selected === "home" && draft.home.promos.some((p) => !p.title.trim() || !categories.some((c) => c.slug === p.category))) {
      toast.error("Every promotion needs a title and a valid product category."); return;
    }
    if (selected === "faq" && draft.faq.items.some((i) => !i.question.trim() || !i.answer.trim())) {
      toast.error("Every FAQ needs both a question and answer."); return;
    }
    if (selected === "footer") {
      if (!draft.footer.brandName.trim()) { toast.error("Enter a brand name"); return; }
      for (const url of [draft.footer.facebook, draft.footer.instagram].filter(Boolean)) {
        try {
          const parsed = new URL(url);
          if (!["https:", "http:"].includes(parsed.protocol)) throw Error("invalid");
        } catch { toast.error("Enter complete Facebook/Instagram URLs beginning with https://"); return; }
      }
    }
    setBusy(true);
    try {
      const { error } = await supabase.from("site_content").upsert({
        section: selected,
        content: draft[selected] as unknown as Json,
        updated_at: new Date().toISOString(),
      }, { onConflict: "section" });
      if (error) throw error;
      toast.success("Saved. Store pages now use this content.");
      await qc.invalidateQueries({ queryKey: ["catalog"] });
    } catch (e) {
      toast.error("Unable to save content: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return <section className="mt-8 rounded-lg border border-border bg-card p-4 sm:p-6" aria-label="Website content management">
    <h2 className="text-2xl">Website Content</h2>
    <p className="mt-1 text-sm text-muted-foreground">Edit the text, images, promotions, FAQ and delivery areas visible to shoppers. Choose a section, make changes, then save.</p>
    {isPreview && <p role="status" className="mt-3 text-sm text-destructive">The public catalog is in preview mode. Verify database connection before publishing edits.</p>}
    <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Content sections">
      {SECTIONS.map(({ key, label }) =>
        <button key={key} type="button" role="tab" aria-selected={selected === key}
          onClick={() => setSelected(key)}
          className={`min-h-11 shrink-0 rounded-md border px-3 text-sm ${selected === key ? "border-primary bg-primary-soft font-semibold text-primary" : "border-input"}`}>
          {label}
        </button>)}
    </div>
    <div role="tabpanel" className="mt-5 space-y-5">
      {selected === "home" && <>
        <Text label="Top announcement bar" value={draft.home.announcement} onChange={(v) => update("home", { announcement: v })} />
        <ImageField label="Homepage hero image" value={draft.home.heroImage} onChange={(v) => update("home", { heroImage: v })} />
        <h3 className="text-lg font-semibold">Homepage highlights</h3>
        {draft.home.highlights.map((item, i) => <div key={i} className="grid gap-3 sm:grid-cols-2">
          <Text label={`Highlight ${i + 1}: title`} value={item.title} onChange={(v) => updateFeature("home", i, { title: v })} />
          <Text label="Short line" value={item.body} onChange={(v) => updateFeature("home", i, { body: v })} />
        </div>)}
        <h3 className="text-lg font-semibold">Promotion banners</h3>
        {draft.home.promos.map((promo, i) => <div key={i} className="space-y-3 rounded-md border border-border p-3">
          <div className="flex justify-between gap-2"><b className="text-sm">Banner {i + 1}</b>
            <button type="button" onClick={() => update("home", { promos: draft.home.promos.filter((_, j) => j !== i) })}
              className="text-sm text-destructive"><Trash2 className="inline size-4" /> Remove</button></div>
          <Text label="Banner title" value={promo.title} onChange={(v) => updatePromo(i, { title: v })} />
          <Text label="Short description" value={promo.sub} onChange={(v) => updatePromo(i, { sub: v })} />
          <Field label="Shop category for button"><select value={promo.category} className={fieldClass} onChange={(e) => updatePromo(i, { category: e.target.value })}>
            {categories.map((cat) => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
          </select></Field>
          <ImageField label={`Banner ${i + 1} image`} value={promo.image} onChange={(v) => updatePromo(i, { image: v })} />
        </div>)}
        <Button type="button" variant="outline" onClick={() => update("home", { promos: [...draft.home.promos, { title: "", sub: "", category: categories[0]?.slug ?? "", image: "local:honey" }] })}>
          <Plus /> Add promotion
        </Button>
      </>}
      {selected === "about" && <>
        <Text label="Small heading" value={draft.about.eyebrow} onChange={(v) => update("about", { eyebrow: v })} />
        <Text label="Main heading" value={draft.about.title} onChange={(v) => update("about", { title: v })} />
        <Text label="Introduction" value={draft.about.introduction} rows={4} onChange={(v) => update("about", { introduction: v })} />
        <Text label="Additional information" value={draft.about.detail} rows={4} onChange={(v) => update("about", { detail: v })} />
        <ImageField label="About page image" value={draft.about.image} onChange={(v) => update("about", { image: v })} />
      </>}
      {selected === "footer" && <>
        <Text label="Store / brand name" value={draft.footer.brandName} onChange={(v) => update("footer", { brandName: v })} />
        <ImageField label="Store logo" value={draft.footer.logoImage} onChange={(v) => update("footer", { logoImage: v })} />
        <Text label="Brand tagline" value={draft.footer.tagline} onChange={(v) => update("footer", { tagline: v })} />
        <Text label="Footer description" value={draft.footer.description} rows={3} onChange={(v) => update("footer", { description: v })} />
        <Text label="Facebook page URL (optional)" value={draft.footer.facebook} onChange={(v) => update("footer", { facebook: v })} />
        <Text label="Instagram page URL (optional)" value={draft.footer.instagram} onChange={(v) => update("footer", { instagram: v })} />
        <h3 className="text-lg font-semibold">Trust messages</h3>
        {draft.footer.trust.map((item, i) => <div key={i} className="grid gap-3 sm:grid-cols-2">
          <Text label={`Message ${i + 1}`} value={item.title} onChange={(v) => updateFeature("footer", i, { title: v })} />
          <Text label="Explanation" value={item.body} onChange={(v) => updateFeature("footer", i, { body: v })} />
        </div>)}
      </>}
      {selected === "faq" && <>
        {draft.faq.items.map((item, i) => <div key={i} className="space-y-3 rounded-md border border-border p-3">
          <div className="flex justify-between"><b className="text-sm">Question {i + 1}</b><button type="button"
            onClick={() => update("faq", { items: draft.faq.items.filter((_, j) => j !== i) })}
            className="text-sm text-destructive"><Trash2 className="inline size-4" /> Remove</button></div>
          <Text label="Question" value={item.question} onChange={(v) => updateFaq(i, { question: v })} />
          <Text label="Answer" value={item.answer} rows={3} onChange={(v) => updateFaq(i, { answer: v })} />
        </div>)}
        <Button type="button" variant="outline" onClick={() => update("faq", { items: [...draft.faq.items, { question: "", answer: "" }] })}><Plus /> Add question</Button>
      </>}
      {selected === "policies" && <>
        <p className="text-sm text-muted-foreground">Use blank lines between paragraphs. Review policies for legal accuracy before saving.</p>
        {(["delivery", "returns", "privacy", "terms"] as const).map((key) => <Text key={key}
          label={{ delivery: "Delivery information", returns: "Returns & exchanges", privacy: "Privacy policy", terms: "Terms & conditions" }[key]}
          value={draft.policies[key]} rows={8}
          onChange={(v) => update("policies", { [key]: v })} />)}
      </>}
      {selected === "checkout" && <Text label="Karachi delivery areas — one per line"
        value={draft.checkout.areas.join("\n")} rows={12}
        onChange={(v) => update("checkout", { areas: [...new Set(v.split(/\r?\n/).map((x) => x.trim()).filter(Boolean))] })} />}
    </div>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <p className="text-xs text-muted-foreground">Only the selected section will be saved.</p>
      <Button type="button" disabled={busy} onClick={() => void save()}>{busy ? "Saving…" : "Save " + SECTIONS.find((s) => s.key === selected)?.label}</Button>
    </div>
  </section>;
}
