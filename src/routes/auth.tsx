import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
export const Route = createFileRoute("/auth")({ head: () => ({ meta: [{ title: "Admin Sign In — SweeTrade" }, { name: "robots", content: "noindex" }] }), component: AuthPage });
const field = "h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none";
function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/admin", replace: true }); }); }, [navigate]);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    if (!email || password.length < 8) { toast.error("Enter a valid email and password"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error("Invalid credentials or sign in unavailable"); return; }
      navigate({ to: "/admin", replace: true });
    } catch { toast.error("Sign in temporarily unavailable"); }
    finally { setBusy(false); }
  };
  return <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
    <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex justify-center"><Logo /></div>
      <h1 className="text-center text-2xl">Admin Sign In</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">Authorized store administrators only.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div><label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label><input id="email" name="email" type="email" required autoComplete="email" className={field} /></div>
        <div><label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label><input id="password" name="password" type="password" required minLength={8} autoComplete="current-password" className={field} /></div>
        <Button type="submit" block disabled={busy}>{busy ? "Signing in…" : "Sign In"}</Button>
      </form>
    </div>
  </div>;
}
