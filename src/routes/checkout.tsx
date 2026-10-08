import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { formatPrice, PAYMENT_METHODS } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { useCatalog } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Totals } from "@/components/shop/OrderSummary";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Sweet Trade" },
      { name: "description", content: "Guest checkout for orders throughout Pakistan. Shipping and payment options depend on confirmed store settings." },
      { property: "og:title", content: "Checkout — Sweet Trade" },
      { property: "og:description", content: "Complete your order." },
    ],
  }),
  component: Checkout,
});

const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
] as const;

const field = "h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive";

function Checkout() {
  const { lines, clear } = useStore();
  const { settings, content } = useCatalog();
  const requestMode = !settings.deliveryConfigured || lines.some((line) => line.product.requestOnly);
  const paymentOptions = PAYMENT_METHODS.filter((method) =>
    settings.paymentMethods.includes(method) && (!requestMode || method === "Cash on Delivery"));
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone" | "province" | "city" | "area" | "address", string>>>({});
  const [pay, setPay] = useState<string>(paymentOptions[0] ?? "");
  const selectedPay = paymentOptions.some((method) => method === pay) ? pay : paymentOptions[0] ?? "";
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy || !lines.length) return;
    const f = new FormData(e.currentTarget);
    const err: Partial<Record<"name" | "phone" | "province" | "city" | "area" | "address", string>> = {};
    if (!String(f.get("name")).trim()) err.name = "Please enter your full name";
    if (!/^(\+92|0)3\d{2}\s?\d{7}$/.test(String(f.get("phone")).replace(/[\s-]/g, "").replace(/^(\+92|0)(3\d{2})(\d{7})$/, "$1$2$3"))) err.phone = "Enter a valid mobile number, e.g. 0334 3645850";
    if (!PROVINCES.some((p) => p === String(f.get("province")))) err.province = "Select your province or region";
    const city = String(f.get("city") ?? "").trim();
    if (city.length < 2 || city.length > 120) err.city = "Enter your city (2–120 characters)";
    const area = String(f.get("area") ?? "").trim();
    if (area.length < 2 || area.length > 120) err.area = "Enter your area, town or neighbourhood";
    if (!String(f.get("address")).trim()) err.address = "Please enter your address";
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    if (!selectedPay) { toast.error("No payment option is currently available. Please contact us."); return; }
    if (requestMode && !settings.pendingOrdersEnabled) { toast.error("Order requests are currently unavailable."); return; }
    if (requestMode && f.get("accept_estimate") !== "on") {
      toast.error("Please confirm that you understand these prices and shipping are subject to confirmation.");
      return;
    }
    setBusy(true);
    try {
      const notes = [
        f.get("postal_code") && `Postal code: ${f.get("postal_code")}`,
        f.get("landmark") && `Landmark: ${f.get("landmark")}`,
        f.get("notes"),
      ].filter(Boolean).join("\n");
      const id = crypto.randomUUID();
      const { error } = await supabase.from("orders").insert({
        id,
        customer_name: String(f.get("name")).trim().slice(0, 120),
        phone: String(f.get("phone")).trim().slice(0, 30),
        province: String(f.get("province")),
        city: String(f.get("city")).trim().slice(0, 120),
        area: String(f.get("area")).trim().slice(0, 120),
        address: String(f.get("address")).trim().slice(0, 500),
        notes: notes ? String(notes).slice(0, 1000) : null,
        payment_method: selectedPay,
        items: lines.map((l) => ({ product_id: l.productId, variant: l.variant, qty: l.qty })),
      });
      if (error) throw error;
      setDone(id.slice(0, 8).toUpperCase());
      clear();
    } catch (error) {
      console.error("Order submission failed", error);
      toast.error("Could not place your order. Please try again or contact Sweet Trade.");
    } finally {
      setBusy(false);
    }
  };

  if (done !== null) {
    return (
      <div className="container-page py-24 text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h1 className="mt-4 text-3xl">{requestMode ? "Your order request has been received" : "Thank you for your order"}</h1>
        <p className="mt-2 text-muted-foreground">Reference #{done}. Sweet Trade will contact you by phone to confirm availability, final prices and delivery charges before processing the order. No payment has been collected.</p>
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

  const Err = ({ k }: { k: "name" | "phone" | "province" | "city" | "area" | "address" }) => (errors[k] ? <p id={`${k}-err`} className="mt-1 text-xs text-destructive">{errors[k]}</p> : null);
  const L = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">{children}</label>;

  return (
    <form noValidate onSubmit={submit} className="container-page grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-12">
      <h1 className="sr-only">Checkout</h1>
      <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-5 text-xl">1. Delivery Information</h2>
        <p className="mb-4 text-sm text-muted-foreground">Country: Pakistan. Enter your actual province, city and complete delivery address. Delivery availability and charges are confirmed by Sweet Trade.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><L htmlFor="name">Full Name *</L><input id="name" name="name" autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby="name-err" /><Err k="name" /></div>
          <div><L htmlFor="phone">Mobile Number *</L><input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+92 3XX XXXXXXX" className={field} aria-invalid={!!errors.phone} aria-describedby="phone-err" /><Err k="phone" /></div>
          <div>
            <L htmlFor="province">Province / Region *</L>
            <select id="province" name="province" defaultValue="" className={field}
              aria-invalid={!!errors.province} aria-describedby="province-err">
              <option value="" disabled>Select province or region</option>
              {PROVINCES.map((province) => <option key={province} value={province}>{province}</option>)}
            </select><Err k="province" />
          </div>
          <div>
            <L htmlFor="city">City *</L>
            <input id="city" name="city" required maxLength={120} autoComplete="address-level2"
              placeholder="e.g. Lahore, Karachi, Multan" list="pakistan-cities"
              aria-invalid={!!errors.city} aria-describedby="city-err" className={field} />
            <datalist id="pakistan-cities">
              {content.checkout.cities.map((city) => <option key={city} value={city} />)}
            </datalist><Err k="city" />
          </div>
          <div>
            <L htmlFor="area">Area / Town *</L>
            <input id="area" name="area" required maxLength={120} autoComplete="address-level3"
              placeholder="Your neighbourhood, locality or village"
              aria-invalid={!!errors.area} aria-describedby="area-err" className={field} />
            <Err k="area" />
          </div>
          <div>
            <L htmlFor="postal_code">Postal Code (Optional)</L>
            <input id="postal_code" name="postal_code" inputMode="numeric" autoComplete="postal-code"
              maxLength={12} placeholder="Postal code" className={field} />
          </div>
          <div className="sm:col-span-2"><L htmlFor="address">Address *</L><input id="address" name="address" autoComplete="street-address" placeholder="House / street / road / village and nearby details" className={field} aria-invalid={!!errors.address} aria-describedby="address-err" /><Err k="address" /></div>
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
          {requestMode && (
            <p role="note" className="mt-4 rounded-md border border-border bg-secondary p-3 text-sm">
              These are estimated product prices. Shipping and the final amount will be confirmed by our team for your Pakistan delivery address. No online payment is taken.
            </p>
          )}
        </section>
        <fieldset className="rounded-lg border border-border bg-card p-5">
          <legend className="sr-only">Payment method</legend>
          <h2 className="mb-4 text-xl">3. Payment Method</h2>
          <div className="space-y-2">
            {paymentOptions.map((m) => (
              <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-sm ${selectedPay === m ? "border-primary bg-primary-soft" : "border-input"}`}>
                <input type="radio" name="payment" value={m} checked={selectedPay === m} onChange={() => setPay(m)} className="size-4 accent-primary" />
                {m}
              </label>
            ))}
          </div>
          {!paymentOptions.length && <p className="text-sm text-destructive">No payment methods are configured. Please contact us.</p>}
          {requestMode && (
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input name="accept_estimate" type="checkbox" className="mt-0.5 size-4 shrink-0 accent-primary" required />
              <span>I understand this is an order request only. Product prices, availability, shipping and the final total must be confirmed by phone before fulfillment. No advance payment is required.</span>
            </label>
          )}
          {requestMode && !settings.pendingOrdersEnabled && <p role="alert" className="mt-3 text-sm text-destructive">Order requests are currently unavailable. Please contact Sweet Trade.</p>}
          <Button type="submit" size="lg" block className="mt-5" disabled={busy || !paymentOptions.length || (requestMode && !settings.pendingOrdersEnabled)}>
            {busy ? "Submitting…" : requestMode ? "Submit Order Request" : "Place Order"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">No account required. Sweet Trade confirms orders by phone.</p>
        </fieldset>
      </aside>
    </form>
  );
}
