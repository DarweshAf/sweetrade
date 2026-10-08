import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCatalog } from "@/lib/catalog";
import { adminField } from "@/lib/admin";
import { PAYMENT_METHODS } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { AdminContentEditor } from "@/components/site/AdminContentEditor";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { settings: s } = useCatalog();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const str = (k: string) => String(f.get(k) ?? "").trim();
    const enabledMethods = f.getAll("payment_methods").map(String).filter((m) => PAYMENT_METHODS.some((allowed) => allowed === m));
    if (!enabledMethods.length) { toast.error("Enable at least one payment method"); return; }
    setBusy(true);
    const { error } = await supabase.from("site_settings").upsert({
      id: 1,
      phone: str("phone"),
      whatsapp: str("whatsapp").replace(/\D/g, ""),
      email: str("email"),
      delivery_fee: Math.max(0, Number(str("delivery_fee")) || 0),
      delivery_configured: f.get("delivery_configured") === "on",
      free_delivery_threshold: Math.max(0, Number(str("free_delivery_threshold")) || 0),
      payment_methods: enabledMethods,
      hero_title: str("hero_title"),
      hero_subtitle: str("hero_subtitle"),
      updated_at: new Date().toISOString(),
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey: ["catalog"] });
  };

  const F = ({ name, label, def, type = "text" }: { name: string; label: string; def: string | number; type?: string }) => (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">{label}</label>
      <input id={name} name={name} type={type} defaultValue={def} required={name !== "email"} className={adminField} />
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Site Settings</h1>
        <a href="#website-content" className="inline-flex min-h-11 items-center rounded-md border border-primary px-3 text-sm font-semibold text-primary hover:bg-primary-soft">
          Edit website text, images & FAQs ↓
        </a>
      </div>
      <form onSubmit={save} className="space-y-6 rounded-lg border border-border bg-card p-5 sm:p-6">
        <section className="grid gap-4 sm:grid-cols-2">
          <h2 className="text-lg sm:col-span-2">Contact</h2>
          <F name="phone" label="Phone" def={s.phone} />
          <F name="whatsapp" label="WhatsApp number (digits, e.g. 923001234567)" def={s.whatsapp} />
          <div className="sm:col-span-2"><F name="email" label="Email" def={s.email} type="email" /></div>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          <h2 className="text-lg sm:col-span-2">Pakistan-wide Delivery</h2>
          <p className="text-sm text-muted-foreground sm:col-span-2">These are single store-wide rates. Enable checkout only after confirming the fee and coverage for all destinations you intend to accept. If fees differ by city, leave checkout disabled and confirm individual charges with customers.</p>
          <F name="delivery_fee" label="Flat Pakistan delivery fee (Rs.)" def={s.deliveryFee} type="number" />
          <F name="free_delivery_threshold" label="Free delivery threshold (Rs.)" def={s.freeDeliveryThreshold} type="number" />
          <label className="flex min-h-11 items-start gap-3 sm:col-span-2"><input type="checkbox" name="delivery_configured" defaultChecked={s.deliveryConfigured} className="mt-1 size-5 accent-primary" /><span className="text-sm">I confirm these rates and coverage are valid for the Pakistan destinations I accept; enable online checkout.</span></label>
        </section>
        <fieldset className="rounded-lg border border-border p-4">
          <legend className="px-2 text-lg">Accepted Payment Methods</legend>
          <p className="mb-3 text-sm text-muted-foreground">Only enable methods the business can actually process.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PAYMENT_METHODS.map((method) => <label key={method} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="payment_methods" value={method} defaultChecked={s.paymentMethods.includes(method)} className="size-5 accent-primary" />{method}</label>)}
          </div>
        </fieldset>
        <section className="grid gap-4">
          <h2 className="text-lg">Homepage</h2>
          <F name="hero_title" label="Hero title" def={s.heroTitle} />
          <div>
            <label htmlFor="hero_subtitle" className="mb-1.5 block text-sm font-medium">Hero text</label>
            <textarea id="hero_subtitle" name="hero_subtitle" rows={3} defaultValue={s.heroSubtitle} className={`${adminField} h-auto py-2`} />
          </div>
        </section>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save settings"}</Button>
      </form>
      <AdminContentEditor />
    </div>
  );
}
