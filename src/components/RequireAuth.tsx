import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

/** Client-side gate for customer pages. Data is also protected by database policies. */
export function RequireAuth({ children, message }: { children: ReactNode; message?: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto h-40 max-w-md rounded-2xl skeleton-shimmer" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-card">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft">
            <Lock className="size-5 text-primary" />
          </div>
          <h1 className="mt-4 text-lg font-semibold">Sign in to continue</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {message ?? "You need an account to view this page."}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth" search={{ mode: "register" as const }}>
                Create account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
