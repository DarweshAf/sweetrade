import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/catalog";
import { adminField, ORDER_STATUSES } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: Orders,
});

interface Item { name: string; variant: string; price: number; qty: number }

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
                    <span className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()} · {o.area} · {o.payment_method}</span>
                  </button>
                  <b>{formatPrice(o.total)}</b>
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className={`${adminField} w-auto capitalize`} aria-label="Order status">
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => del(o.id)} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Delete order"><Trash2 className="size-4" /></button>
                </div>
                {open === o.id && (
                  <div className="grid gap-4 border-t border-border p-4 text-sm sm:grid-cols-2">
                    <div className="space-y-1">
                      <p><b>Phone:</b> <a className="text-primary" href={`tel:${o.phone}`}>{o.phone}</a></p>
                      <p><b>Address:</b> {o.address}, {o.area}, Karachi</p>
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
                        <p className="flex justify-between"><span>Delivery</span><span>{formatPrice(o.delivery)}</span></p>
                        <p className="flex justify-between font-semibold"><span>Total</span><span>{formatPrice(o.total)}</span></p>
                      </div>
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
