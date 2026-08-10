import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const GUEST_KEY = "wagi_guest_wishlist_v1";

function readGuest(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(GUEST_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/** Wishlist stored in the database for signed-in customers, locally for guests. */
export function useWishlist() {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const userId = user?.id ?? null;

  const load = useCallback(async () => {
    if (userId) {
      const { data } = await supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("user_id", userId);
      setIds((data ?? []).map((r) => r.product_id));
    } else {
      setIds(readGuest());
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = useCallback(
    async (productId: string) => {
      const has = ids.includes(productId);
      const next = has ? ids.filter((id) => id !== productId) : [...ids, productId];
      setIds(next);
      if (userId) {
        if (has) {
          await supabase
            .from("wishlist_items")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", productId);
        } else {
          await supabase.from("wishlist_items").insert({ user_id: userId, product_id: productId });
        }
      } else {
        window.localStorage.setItem(GUEST_KEY, JSON.stringify(next));
      }
      return !has;
    },
    [ids, userId],
  );

  return { ids, toggle, has: (id: string) => ids.includes(id), reload: load };
}
