import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

type Search = { mode?: "login" | "register" | undefined };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    mode: search["mode"] === "register" ? "register" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In or Create Account | WAGI - STATIONARIES" },
      { name: "description", content: "Access your WAGI account to track orders and check out faster." },
      { property: "og:title", content: "Sign In | WAGI - STATIONARIES" },
      { property: "og:description", content: "Sign in with email or Google to shop with WAGI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRegister, setIsRegister] = useState(mode === "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) void navigate({ to: "/", replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setBusy(true);
    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName.trim(), phone: phone.trim() },
        },
      });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      if (!data.session) {
        setSent(true);
        return;
      }
      toast.success("Welcome to WAGI!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Signed in");
    }
  };

  const resetPassword = async (): Promise<void> => {
    if (!email.trim()) { toast.error("Enter your email first"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Password reset link sent to your email");
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-3xl border bg-card p-7 shadow-elevated">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        {sent ? (
          <div className="mt-6 text-center">
            <h1 className="text-lg font-bold">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a confirmation link to {email}. Click it to activate your account.
            </p>
          </div>
        ) : (
          <>
            <h1 className="mt-6 text-center text-xl font-bold">
              {isRegister ? "Create your account" : "Welcome back"}
            </h1>
            <form onSubmit={submit} className="mt-5 space-y-3">
              {isRegister && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input id="fullName" value={fullName} maxLength={100} required
                      onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} maxLength={20} placeholder="07XX XXX XXX"
                      onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} maxLength={255} required
                  onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} minLength={6} required
                  onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={busy}>
                {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
              </Button>
            </form>

            <div className="mt-4 flex justify-between text-sm">
              <button type="button" className="text-primary hover:underline"
                onClick={() => setIsRegister((v) => !v)}>
                {isRegister ? "I already have an account" : "Create an account"}
              </button>
              {!isRegister && (
                <button type="button" className="text-muted-foreground hover:text-primary"
                  onClick={resetPassword}>
                  Forgot password?
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
