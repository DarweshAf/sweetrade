import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { formatPrice, KARACHI_AREAS, PAYMENT_METHODS } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Totals } from "@/components/shop/OrderSummary";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Sweet Trade" },
      { name: "description", content: "Guest checkout with Karachi delivery and Cash on Delivery, Bank Transfer, JazzCash or Easypaisa." },
      { property: "og:title", content: "Checkout — Sweet Trade" },
      { property: "og:description", content: "Complete your order." },
    ],
  }),
  component: Checkout,
});

const field = "h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive";

function Checkout() {
  const { lines, clear } = useStore();
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone" | "area" | "address", string>>>({});
  const [pay, setPay] = useState<string>(PAYMENT_METHODS[0]);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const err: Partial<Record<"name" | "phone" | "area" | "address", string>> = {};
    if (!String(f.get("name")).trim()) err.name = "Please enter your full name";
    if (!/^(\+92|0)3\d{2}\s?\d{7}$/.test(String(f.get("phone")).replace(/[\s-]/g, "").replace(/^(\+92|0)(3\d{2})(\d{7})$/, "$1$2$3"))) err.phone = "Enter a valid mobile number, e.g. 0334 3645850";
    if (!f.get("area")) err.area = "Select your area";
    if (!String(f.get("address")).trim()) err.address = "Please enter your address";
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    setBusy(true);
    const notes = [f.get("landmark") && `Landmark: ${f.get("landmark")}`, f.get("notes")].filter(Boolean).join("\n");
    const id = crypto.randomUUID();
    const { error } = await supabase
      .from("orders")
      .insert({
        id,
        customer_name: String(f.get("name")).trim().slice(0, 120),
        phone: String(f.get("phone")).trim().slice(0, 30),
        area: String(f.get("area")),
        address: String(f.get("address")).trim().slice(0, 500),
        notes: notes ? String(notes).slice(0, 1000) : null,
        payment_method: pay,
        items: lines.map((l) => ({ product_id: l.productId, variant: l.variant, qty: l.qty })),
      });
    setBusy(false);
    if (error) {
      console.error(error);
      toast.error("Could not place your order. Please try again or order on WhatsApp.");
      return;
    }
    setDone(id.slice(0, 8).toUpperCase());
    clear();
  };

  if (done !== null) {
    return (
      <div className="container-page py-24 text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h1 className="mt-4 text-3xl">Thank you for your order</h1>
        <p className="mt-2 text-muted-foreground">Your order #{done} has been received. Our team will confirm it by phone shortly.</p>
        <Button asChild size="lg" className="mt-6"><Link to="/shop">Continue Shopping</Link></Button>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-3xl">Nothing to check out yet</h1>
        <Button asChild size="lg" className="mt-6"><Link to="/shop">Browse Products</Link></Button>
      </div>
    );
  }

  const Err = ({ k }: { k: "name" | "phone" | "area" | "address" }) => (errors[k] ? <p id={`${k}-err`} className="mt-1 text-xs text-destructive">{errors[k]}</p> : null);
  const L = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">{children}</label>;

  return (
    <form noValidate onSubmit={submit} className="container-page grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-12">
      <h1 className="sr-only">Checkout</h1>
      <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-5 text-xl">1. Delivery Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><L htmlFor="name">Full Name *</L><input id="name" name="name" autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby="name-err" /><Err k="name" /></div>
          <div><L htmlFor="phone">Mobile Number *</L><input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+92 3XX XXXXXXX" className={field} aria-invalid={!!errors.phone} aria-describedby="phone-err" /><Err k="phone" /></div>
          <div><L htmlFor="city">City *</L><select id="city" name="city" className={field} defaultValue="Karachi"><option>Karachi</option></select></div>
          <div>
            <L htmlFor="area">Area *</L>
            <select id="area" name="area" className={field} defaultValue="" aria-invalid={!!errors.area} aria-describedby="area-err">
              <option value="" disabled>Select area</option>
              {KARACHI_AREAS.map((a) => <option key={a}>{a}</option>)}
            </select><Err k="area" />
          </div>
          <div className="sm:col-span-2"><L htmlFor="address">Address *</L><input id="address" name="address" autoComplete="street-address" placeholder="House, street, block" className={field} aria-invalid={!!errors.address} aria-describedby="address-err" /><Err k="address" /></div>
          <div className="sm:col-span-2"><L htmlFor="landmark">Landmark (Optional)</L><input id="landmark" name="landmark" placeholder="Near…" className={field} /></div>
          <div className="sm:col-span-2"><L htmlFor="notes">Order Notes (Optional)</L><textarea id="notes" name="notes" rows={3} placeholder="Any special instructions…" className={`${field} h-auto py-2`} /></div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-xl">2. Order Summary</h2>
          <ul className="mb-4 space-y-3">
            {lines.map((l) => (
              <li key={l.productId + l.variant} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 text-sm">
                <img src={l.product.image} alt="" className="size-12 rounded object-cover" />
                <span className="min-w-0"><span className="block truncate font-medium">{l.product.name}</span><span className="text-muted-foreground">{l.variant} × {l.qty}</span></span>
                <span className="font-medium">{formatPrice(l.total)}</span>
              </li>
            ))}
          </ul>
          <Totals />
        </section>
        <fieldset className="rounded-lg border border-border bg-card p-5">
          <legend className="sr-only">Payment method</legend>
          <h2 className="mb-4 text-xl">3. Payment Method</h2>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((m) => (
              <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-sm ${pay === m ? "border-primary bg-primary-soft" : "border-input"}`}>
                <input type="radio" name="payment" value={m} checked={pay === m} onChange={() => setPay(m)} className="size-4 accent-primary" />
                {m}
              </label>
            ))}
          </div>
          <Button type="submit" size="lg" block className="mt-5" disabled={busy}>{busy ? "Placing order…" : "Place Order"}</Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">No account needed. We confirm every order by phone.</p>
        </fieldset>
      </aside>
    </form>
  );
}
