import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { formatDateTime } from "@/lib/format";
import type { Notification } from "@/lib/db-types";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | WAGI - STATIONARIES" },
      { name: "description", content: "Order updates and announcements from WAGI - STATIONARIES." },
      { property: "og:title", content: "Notifications | WAGI - STATIONARIES" },
      { property: "og:description", content: "Stay updated on your orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth message="Sign in to see your notifications.">
      <NotificationsPage />
    </RequireAuth>
  ),
});

function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems(data ?? []);
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
    })();
  }, [user]);

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
      {items.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary-soft">
            <Bell className="size-7 text-primary" />
          </div>
          <p className="mt-5 text-sm text-muted-foreground">You have no notifications yet.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((n) => (
            <li key={n.id} className="rounded-2xl border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{n.title}</p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDateTime(n.created_at)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
