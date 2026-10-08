import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCatalog } from "@/lib/catalog";
import { adminField } from "@/lib/admin";
import { Button } from "@/components/ui/button";

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
    setBusy(true);
    const { error } = await supabase.from("site_settings").upsert({
      id: 1,
      phone: str("phone"),
      whatsapp: str("whatsapp").replace(/\D/g, ""),
      email: str("email"),
      delivery_fee: Math.max(0, Number(str("delivery_fee")) || 0),
      free_delivery_threshold: Math.max(0, Number(str("free_delivery_threshold")) || 0),
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
      <input id={name} name={name} type={type} defaultValue={def} required className={adminField} />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-3xl">Site Settings</h1>
      <form onSubmit={save} className="space-y-6 rounded-lg border border-border bg-card p-5 sm:p-6">
        <section className="grid gap-4 sm:grid-cols-2">
          <h2 className="text-lg sm:col-span-2">Contact</h2>
          <F name="phone" label="Phone" def={s.phone} />
          <F name="whatsapp" label="WhatsApp number (digits, e.g. 923001234567)" def={s.whatsapp} />
          <div className="sm:col-span-2"><F name="email" label="Email" def={s.email} type="email" /></div>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          <h2 className="text-lg sm:col-span-2">Delivery</h2>
          <F name="delivery_fee" label="Delivery fee (Rs.)" def={s.deliveryFee} type="number" />
          <F name="free_delivery_threshold" label="Free delivery above (Rs.)" def={s.freeDeliveryThreshold} type="number" />
        </section>
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
    </div>
  );
}
