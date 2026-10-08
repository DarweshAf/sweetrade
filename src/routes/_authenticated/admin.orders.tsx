import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/catalog";
import { adminField, ORDER_STATUSES } from "@/lib/admin";
import type { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: Orders,
});

interface Item { product_id?: string; name: string; variant: string; price: number; qty: number }

function Orders() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });

  const setStatus = async (id: string, status: string) => {
    const order = q.data?.find((o) => o.id === id);
    if (order?.is_provisional && !["pending", "cancelled"].includes(status)) {
      toast.error("Confirm the final item prices and shipping charge with the customer before progressing this order."); return;
    }
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated");
    refresh();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this order permanently?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  };

  const rows = (q.data ?? []).filter((o) => filter === "all" || o.status === filter);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`${adminField} w-auto capitalize`}>
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {q.isLoading ? <p className="text-muted-foreground">Loading…</p> : q.isError ? <div role="alert" className="rounded-lg border border-destructive p-5 text-sm">Unable to load orders. Please retry later.</div> : !rows.length ? (
        <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">No orders.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((o) => {
            const items = (Array.isArray(o.items) ? o.items : []) as unknown as Item[];
            return (
              <li key={o.id} className="rounded-lg border border-border bg-card">
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <button onClick={() => setOpen(open === o.id ? null : o.id)} className="min-w-0 flex-1 text-left">
                    <b className="block font-medium">#{o.id.slice(0, 8).toUpperCase()} · {o.customer_name}</b>
                    <span className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()} · {[o.city, o.province].filter(Boolean).join(", ") || o.area} · {o.payment_method}{o.is_provisional ? " · Provisional request" : ""}</span>
                  </button>
                  <span className="text-right"><b className="block">{formatPrice(o.total)}</b>{o.is_provisional && <span className="text-xs text-destructive">Estimated only</span>}</span>
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className={`${adminField} w-auto capitalize`} aria-label="Order status">
                    {ORDER_STATUSES.filter((s) => !o.is_provisional || ["pending", "cancelled"].includes(s)).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => del(o.id)} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Delete order"><Trash2 className="size-4" /></button>
                </div>
                {open === o.id && (
                  <div className="grid gap-4 border-t border-border p-4 text-sm sm:grid-cols-2">
                    <div className="space-y-1">
                      {o.is_provisional && <p className="rounded-md border border-border bg-secondary p-2 font-medium">Order request: confirm product prices, stock and {o.shipping_pending ? "shipping charge" : "delivery"} with the customer before fulfillment. No upfront payment has been collected.</p>}
                      <p><b>Phone:</b> <a className="text-primary" href={`tel:${o.phone}`}>{o.phone}</a></p>
                      <p><b>Address:</b> {[o.address, o.area, o.city, o.province, "Pakistan"].filter(Boolean).join(", ")}</p>
                      {o.notes && <p className="whitespace-pre-line"><b>Notes:</b> {o.notes}</p>}
                    </div>
                    <div>
                      <ul className="space-y-1">
                        {items.map((it, i) => (
                          <li key={i} className="flex justify-between gap-2"><span>{it.name} ({it.variant}) × {it.qty}</span><span>{formatPrice(it.price * it.qty)}</span></li>
                        ))}
                      </ul>
                      <div className="mt-2 space-y-1 border-t border-border pt-2">
                        <p className="flex justify-between"><span>Subtotal</span><span>{formatPrice(o.subtotal)}</span></p>
                        <p className="flex justify-between"><span>Delivery</span><span>{o.shipping_pending ? "To be confirmed" : formatPrice(o.delivery)}</span></p>
                        <p className="flex justify-between font-semibold"><span>{o.is_provisional ? "Estimated products / total" : "Total"}</span><span>{formatPrice(o.total)}</span></p>
                      </div>
                      {o.is_provisional && o.status === "pending" && <FinalizeOrder
                        key={o.id} orderId={o.id} items={items} previousDelivery={o.delivery}
                        shippingPending={o.shipping_pending} onSaved={refresh} />}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Finalize only after calling the customer. Draft amounts are never treated as payment. */
function FinalizeOrder({ orderId, items, previousDelivery, shippingPending, onSaved }: {
  orderId: string;
  items: Item[];
  previousDelivery: number;
  shippingPending: boolean;
  onSaved: () => void;
}) {
  const [unitPrices, setUnitPrices] = useState(items.map((item) => String(item.price)));
  const [shipping, setShipping] = useState(shippingPending ? "" : String(previousDelivery));
  const [busy, setBusy] = useState(false);
  const validNumber = (text: string, allowZero: boolean) => {
    const number = Number(text);
    return text.trim() !== "" && Number.isSafeInteger(number) &&
      number >= (allowZero ? 0 : 1) && number <= 2_000_000_000;
  };
  const pricesValid = unitPrices.length === items.length && unitPrices.every((price) => validNumber(price, false));
  const shippingValid = validNumber(shipping, true);
  const subtotal = pricesValid ? items.reduce((n, item, i) => n + Number(unitPrices[i]) * item.qty, 0) : 0;
  const total = subtotal + Number(shipping || 0);
  const amountValid = pricesValid && shippingValid && subtotal > 0 && total <= 2147483647;

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!amountValid) { toast.error("Enter valid product prices and a confirmed delivery amount."); return; }
    if (form.get("customer_confirmed") !== "on") {
      toast.error("You must confirm the final price, stock and shipping with the customer."); return;
    }
    if (busy) return;
    setBusy(true);
    const finalItems = items.map((item, i) => ({ ...item, price: Number(unitPrices[i]) }));
    try {
      const { data, error } = await supabase.from("orders").update({
        items: finalItems as unknown as Json,
        subtotal,
        delivery: Number(shipping),
        total,
        shipping_pending: false,
        is_provisional: false,
        status: "confirmed",
      }).eq("id", orderId).eq("is_provisional", true).eq("status", "pending").select("id").maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Order was changed by another admin. Refresh and review it again.");
      toast.success("Customer-confirmed prices and shipping saved. Order marked Confirmed.");
      onSaved();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return <form onSubmit={save} className="mt-4 space-y-3 rounded-md border border-primary/30 bg-primary-soft p-3">
    <h3 className="font-semibold">Confirm the customer’s order</h3>
    <p className="text-xs text-muted-foreground">
      Call the customer to verify product availability, final prices and their delivery fee. Enter
      agreed unit prices below. This confirmation records an order, not a payment.
    </p>
    {items.map((item, i) => <label key={i} className="grid items-center gap-2 sm:grid-cols-[1fr_110px]">
      <span>{item.name} ({item.variant}) × {item.qty} · Unit price (PKR)</span>
      <input type="number" inputMode="numeric" min={1} max={2_000_000_000} step={1}
        value={unitPrices[i] ?? ""} onChange={(e) => setUnitPrices((all) => all.map((v, n) => n === i ? e.target.value : v))}
        className={adminField} aria-label={`Confirmed PKR unit price for ${item.name} ${item.variant}`} required />
    </label>)}
    <label className="grid items-center gap-2 sm:grid-cols-[1fr_110px]">
      <span>Confirmed shipping charge in PKR (type 0 only if genuinely free)</span>
      <input type="number" inputMode="numeric" min={0} max={2_000_000_000} step={1} value={shipping}
        onChange={(e) => setShipping(e.target.value)} className={adminField} required />
    </label>
    <p className="font-semibold">Final total: {amountValid ? formatPrice(total) : "Enter all amounts"}</p>
    <label className="flex items-start gap-2">
      <input type="checkbox" name="customer_confirmed" required className="mt-1 size-4 shrink-0 accent-primary" />
      <span>I spoke to the customer and confirmed the final price, stock and shipping charge.</span>
    </label>
    <Button type="submit" disabled={busy || !amountValid} className="w-full sm:w-auto">
      {busy ? "Saving…" : "Save & Confirm Order"}
    </Button>
  </form>;
}
