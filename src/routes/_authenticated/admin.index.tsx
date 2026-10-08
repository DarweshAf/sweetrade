import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/catalog";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const q = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [orders, products, cats] = await Promise.all([
        supabase.from("orders").select("id, customer_name, total, status, created_at").order("created_at", { ascending: false }),
        supabase.from("products").select("id, in_stock"),
        supabase.from("categories").select("slug"),
      ]);
      if (orders.error) throw orders.error;
      return { orders: orders.data ?? [], products: products.data ?? [], cats: cats.data ?? [] };
    },
  });
  const d = q.data;
  const revenue = d?.orders.filter((o) => o.status !== "cancelled").reduce((n, o) => n + o.total, 0) ?? 0;
  const stats = [
    ["Total orders", d?.orders.length ?? "—"],
    ["Pending orders", d?.orders.filter((o) => o.status === "pending").length ?? "—"],
    ["Revenue", d ? formatPrice(revenue) : "—"],
    ["Products", d ? `${d.products.length} (${d.products.filter((p) => !p.in_stock).length} out of stock)` : "—"],
  ];
  return (
    <div>
      <h1 className="mb-6 text-3xl">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([l, v]) => (
          <div key={l} className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{l}</p>
            <p className="mt-1 text-2xl font-semibold">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary">View all</Link>
        </div>
        {d?.orders.length ? (
          <ul className="divide-y divide-border">
            {d.orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                <span className="min-w-0"><b className="block truncate font-medium">{o.customer_name}</b><span className="text-muted-foreground">{new Date(o.created_at).toLocaleString()}</span></span>
                <span className="text-right"><b className="block">{formatPrice(o.total)}</b><span className="capitalize text-muted-foreground">{o.status}</span></span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-center text-sm text-muted-foreground">{q.isLoading ? "Loading…" : "No orders yet."}</p>
        )}
      </div>
    </div>
  );
}
