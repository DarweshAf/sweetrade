import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, MapPin, Phone, Truck } from "lucide-react";
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
      { name: "robots", content: "noindex,follow,noarchive" },
      { title: "Checkout — SweeTrade" },
      { name: "description", content: "Guest checkout for orders throughout Pakistan. Shipping and payment options depend on confirmed store settings." },
      { property: "og:title", content: "Checkout — SweeTrade" },
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

const field = "min-h-12 w-full min-w-0 max-w-full rounded-lg border border-input bg-card px-3 text-base sm:text-sm focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive";

function Checkout() {
  const { lines, checkoutLines, isBuyNow, ready, clearBuyNow, completeCheckout } = useStore();
  const { settings, content } = useCatalog();
  const requestMode = !settings.deliveryConfigured || checkoutLines.some((line) => line.product.requestOnly);
  const paymentOptions = PAYMENT_METHODS.filter((method) =>
    settings.paymentMethods.includes(method) && (!requestMode || method === "Cash on Delivery"));
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone" | "province" | "city" | "area" | "address", string>>>({});
  const [pay, setPay] = useState<string>(paymentOptions[0] ?? "");
  const selectedPay = paymentOptions.some((method) => method === pay) ? pay : paymentOptions[0] ?? "";
  const [done, setDone] = useState<{ reference: string; isRequest: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy || !ready || !checkoutLines.length) return;
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
        items: checkoutLines.map((l) => ({ product_id: l.productId, variant: l.variant, qty: l.qty })),
      });
      if (error) throw error;
      setDone({ reference: id.slice(0, 8).toUpperCase(), isRequest: requestMode });
      completeCheckout();
    } catch (error) {
      console.error("Order submission failed", error);
      toast.error("Could not place your order. Please try again or contact SweeTrade.");
    } finally {
      setBusy(false);
    }
  };

  if (done !== null) {
    return (
      <div className="container-page max-w-2xl py-12 text-center sm:py-20">
        <div className="wow-success-pop mx-auto grid size-20 place-items-center rounded-full bg-primary-soft">
          <CheckCircle2 className="size-12 text-success" aria-hidden />
        </div>
        <h1 className="mt-5 text-3xl sm:text-4xl">{done.isRequest ? "Your order request has been received" : "Thank you for your order"}</h1>
        <p className="mt-3 text-muted-foreground">
          We saved your request. SweeTrade will confirm product availability, final prices and Pakistan delivery charges by phone before dispatch. No online payment was collected.
        </p>
        <div className="mt-6 rounded-xl border border-border bg-card p-5 text-left shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your reference number</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-primary">#{done.reference}</p>
          <ol className="mt-5 space-y-4 border-t border-border pt-5 text-sm">
            <li className="flex items-start gap-3"><ClipboardCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden /><span><strong>1. Request saved</strong><br /><span className="text-muted-foreground">Keep this reference for your records.</span></span></li>
            <li className="flex items-start gap-3"><Phone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /><span><strong>2. Phone confirmation</strong><br /><span className="text-muted-foreground">Our team will discuss price, stock and delivery charges with you.</span></span></li>
            <li className="flex items-start gap-3"><Truck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /><span><strong>3. Delivery after confirmation</strong><br /><span className="text-muted-foreground">Shipping is arranged only after your order is confirmed.</span></span></li>
          </ol>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link to="/shop">Continue Shopping <ArrowRight className="size-4" /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/contact">Contact Support</Link></Button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div role="status" aria-busy="true" aria-label="Loading your checkout" className="container-page grid gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-5 rounded-xl border border-border bg-card p-6"><div className="wow-skeleton h-8 w-48" /><div className="wow-skeleton h-4 w-3/4" />
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">{Array.from({ length: 6 }, (_, i) => <div key={i} className="space-y-2"><div className="wow-skeleton h-4 w-24" /><div className="wow-skeleton h-11 w-full" /></div>)}</div>
      </div>
      <div className="space-y-4 rounded-xl border border-border bg-card p-6"><div className="wow-skeleton h-8 w-36" /><div className="wow-skeleton h-16 w-full" /><div className="wow-skeleton h-16 w-full" /><div className="wow-skeleton h-11 w-full" /></div>
    </div>;
  }

  if (!checkoutLines.length) {
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
    <form noValidate onSubmit={submit} className="container-page grid min-w-0 gap-5 py-7 sm:gap-7 sm:py-9 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8 lg:py-12">
      <h1 className="sr-only">Checkout</h1>
      <section className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl">1. Delivery Information</h2>
          {isBuyNow && <span className="rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">Buy Now · One product</span>}
        </div>
        <div className="mb-5 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground" aria-label="Checkout steps">
          <span className="rounded-full bg-primary-soft px-3 py-1.5 text-primary">1 · Your address</span>
          <span className="rounded-full bg-secondary px-3 py-1.5">2 · Review items</span>
          <span className="rounded-full bg-secondary px-3 py-1.5">3 · Submit request</span>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">Pakistan-wide ordering. Choose your province and enter any city, town or village; the list of suggestions does not restrict where you can request delivery.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><L htmlFor="name">Full Name *</L><input id="name" name="name" autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby="name-err" /><Err k="name" /></div>
          <div><L htmlFor="phone">Mobile Number *</L><input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+92 3XX XXXXXXX" className={field} aria-invalid={!!errors.phone} aria-describedby="phone-err" /><Err k="phone" /></div>
          <div>
            <L htmlFor="province">Province / Region *</L>
            <select id="province" name="province" value={province} onChange={(e) => setProvince(e.target.value)} autoComplete="address-level1" className={field}
              aria-invalid={!!errors.province} aria-describedby="province-err">
              <option value="" disabled>Select province or region</option>
              {PROVINCES.map((province) => <option key={province} value={province}>{province}</option>)}
            </select><Err k="province" />
          </div>
          <div>
            <L htmlFor="city">City *</L>
            <input id="city" name="city" required maxLength={120} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2"
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
          <div className="sm:col-span-2 rounded-lg border border-border bg-secondary/60 p-3 text-sm" aria-live="polite">
            <div className="flex items-center gap-2 font-semibold"><MapPin className="size-4 text-primary" aria-hidden /> Delivery destination</div>
            <p className="mt-1 text-muted-foreground">{[city.trim(), province].filter(Boolean).join(", ") || "Choose your province and enter your city"}, Pakistan</p>
            <p className="mt-1 text-xs text-muted-foreground">Delivery availability, time and final shipping fee are confirmed by phone. No automatic courier fee is promised.</p>
          </div>
          <div className="sm:col-span-2"><L htmlFor="address">Address *</L><input id="address" name="address" autoComplete="street-address" placeholder="House / street / road / village and nearby details" className={field} aria-invalid={!!errors.address} aria-describedby="address-err" /><Err k="address" /></div>
          <div className="sm:col-span-2"><L htmlFor="landmark">Landmark (Optional)</L><input id="landmark" name="landmark" placeholder="Near…" className={field} /></div>
          <div className="sm:col-span-2"><L htmlFor="notes">Order Notes (Optional)</L><textarea id="notes" name="notes" rows={3} placeholder="Any special instructions…" className={`${field} h-auto py-2`} /></div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-card sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl">2. Order Summary</h2>
            {isBuyNow && lines.length > 0 && (
              <button type="button" className="text-xs font-semibold text-primary underline" onClick={clearBuyNow}>
                Use my full cart instead
              </button>
            )}
          </div>
          <ul className="mb-4 space-y-3">
            {checkoutLines.map((l) => (
              <li key={l.productId + l.variant} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 text-sm">
                <img src={l.product.image} alt="" className="size-12 rounded object-cover" />
                <span className="min-w-0"><span className="block truncate font-medium">{l.product.name}</span><span className="text-muted-foreground">{l.variant} × {l.qty}</span></span>
                <span className="font-medium">{formatPrice(l.total)}</span>
              </li>
            ))}
          </ul>
          <Totals checkout />
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
          {requestMode && !settings.pendingOrdersEnabled && <p role="alert" className="mt-3 text-sm text-destructive">Order requests are currently unavailable. Please contact SweeTrade.</p>}
          <Button type="submit" size="lg" block className="mt-5 min-h-12 text-base sm:text-sm" disabled={busy || !paymentOptions.length || (requestMode && !settings.pendingOrdersEnabled)}>
            {busy ? "Submitting…" : requestMode ? "Submit Order Request" : "Place Order"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">No account required. SweeTrade confirms orders by phone.</p>
        </fieldset>
      </aside>
    </form>
  );
}
