import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — SweeTrade" },
      { name: "description", content: "Sign in to manage the SweeTrade store." },
      { property: "og:title", content: "Admin Sign In — SweeTrade" },
      { property: "og:description", content: "Store management sign in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const field = "h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      navigate({ to: "/admin", replace: true });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      if (data.session) navigate({ to: "/admin", replace: true });
      else setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
        <Link to="/" className="mb-6 flex justify-center"><Logo /></Link>
        {sent ? (
          <div className="text-center">
            <h1 className="text-2xl">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">Click the confirmation link we sent you, then sign in.</p>
            <Button className="mt-5" variant="outline" onClick={() => { setSent(false); setMode("in"); }}>Back to sign in</Button>
          </div>
        ) : (
          <>
            <h1 className="text-center text-2xl">{mode === "in" ? "Admin Sign In" : "Create Account"}</h1>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
                <input id="email" name="email" type="email" required autoComplete="email" className={field} />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
                <input id="password" name="password" type="password" required minLength={8} autoComplete={mode === "in" ? "current-password" : "new-password"} className={field} />
              </div>
              <Button type="submit" block disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign In" : "Sign Up"}</Button>
            </form>
            <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-center text-sm text-primary hover:underline">
              {mode === "in" ? "No account? Sign up" : "Already have an account? Sign in"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
