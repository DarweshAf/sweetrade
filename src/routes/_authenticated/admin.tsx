import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderTree, LayoutDashboard, LogOut, Package, Settings, ShoppingBag, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — SweeTrade" },
      { name: "description", content: "Manage SweeTrade products, categories, orders and settings." },
      { property: "og:title", content: "Admin — SweeTrade" },
      { property: "og:description", content: "SweeTrade store admin." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const role = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (error) throw error;
      return !!data;
    },
  });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (role.isLoading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  if (!role.data)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl">No admin access</h1>
        <p className="max-w-sm text-sm text-muted-foreground">Your account ({user.email}) is not an admin. Only the first account created is the store admin.</p>
        <div className="flex gap-3">
          <Button asChild variant="outline"><Link to="/">Go to store</Link></Button>
          <Button onClick={signOut}>Sign out</Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-secondary lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-b border-border bg-card lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between p-4 lg:block">
          <Logo />
          <span className="hidden text-xs text-muted-foreground lg:mt-2 lg:block">Admin Panel</span>
          <div className="flex gap-2 lg:hidden">
            <Button asChild size="sm" variant="outline"><Link to="/">Store</Link></Button>
            <Button size="sm" variant="outline" onClick={signOut}>Sign out</Button>
          </div>
        </div>
        <nav className="hidden lg:flex lg:flex-col lg:gap-1 lg:px-3">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: "exact" in n }}
              className="flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-primary-soft !text-primary font-medium" }}
            >
              <n.icon className="size-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden space-y-1 p-3 lg:absolute lg:bottom-0 lg:block lg:w-full">
          <Link to="/" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"><Store className="size-4" /> View store</Link>
          <button onClick={signOut} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"><LogOut className="size-4" /> Sign out</button>
          <p className="truncate px-3 pt-1 text-xs text-muted-foreground">{user.email}</p>
        </div>
      </aside>
      <div className="min-w-0 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
        <Outlet />
      </div>
      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: "exact" in n }}
            className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground data-[status=active]:text-primary"
          >
            <n.icon className="size-5" aria-hidden /> {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
