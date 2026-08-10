import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { CartLine, Product } from "@/lib/db-types";
import { effectivePrice } from "@/lib/format";

const GUEST_KEY = "wagi_guest_cart_v1";

type GuestLine = { productId: string; quantity: number; savedForLater: boolean };

type CartContextValue = {
  lines: CartLine[];
  activeLines: CartLine[];
  savedLines: CartLine[];
  count: number;
  subtotal: number;
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  setSavedForLater: (productId: string, saved: boolean) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readGuestCart(): GuestLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as GuestLine[]) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(lines: GuestLine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_KEY, JSON.stringify(lines));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [raw, setRaw] = useState<GuestLine[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  const userId = user?.id ?? null;

  const hydrateProducts = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setProducts({});
      return;
    }
    const { data } = await supabase.from("products").select("*").in("id", ids);
    const map: Record<string, Product> = {};
    for (const p of data ?? []) map[p.id] = p;
    setProducts(map);
  }, []);

  /** Loads the cart from the database (signed in) or local storage (guest). */
  const load = useCallback(async () => {
    setLoading(true);
    if (userId) {
      const guest = readGuestCart();
      if (guest.length > 0) {
        // Merge the guest cart into the account on sign-in.
        for (const line of guest) {
          const { data: existing } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("user_id", userId)
            .eq("product_id", line.productId)
            .maybeSingle();
          if (existing) {
            await supabase
              .from("cart_items")
              .update({ quantity: existing.quantity + line.quantity })
              .eq("id", existing.id);
          } else {
            await supabase.from("cart_items").insert({
              user_id: userId,
              product_id: line.productId,
              quantity: line.quantity,
              saved_for_later: line.savedForLater,
            });
          }
        }
        writeGuestCart([]);
      }
      const { data } = await supabase
        .from("cart_items")
        .select("product_id, quantity, saved_for_later")
        .eq("user_id", userId);
      const next = (data ?? []).map((r) => ({
        productId: r.product_id,
        quantity: r.quantity,
        savedForLater: r.saved_for_later,
      }));
      setRaw(next);
      await hydrateProducts(next.map((n) => n.productId));
    } else {
      const guest = readGuestCart();
      setRaw(guest);
      await hydrateProducts(guest.map((n) => n.productId));
    }
    setLoading(false);
  }, [userId, hydrateProducts]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  const persist = useCallback(
    async (next: GuestLine[]) => {
      setRaw(next);
      if (!userId) writeGuestCart(next);
      await hydrateProducts(next.map((n) => n.productId));
    },
    [userId, hydrateProducts],
  );

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      const existing = raw.find((l) => l.productId === productId);
      const next = existing
        ? raw.map((l) =>
            l.productId === productId
              ? { ...l, quantity: l.quantity + quantity, savedForLater: false }
              : l,
          )
        : [...raw, { productId, quantity, savedForLater: false }];
      await persist(next);
      if (userId) {
        if (existing) {
          await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + quantity, saved_for_later: false })
            .eq("user_id", userId)
            .eq("product_id", productId);
        } else {
          await supabase
            .from("cart_items")
            .insert({ user_id: userId, product_id: productId, quantity });
        }
      }
    },
    [raw, persist, userId],
  );

  const setQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity < 1) return;
      await persist(raw.map((l) => (l.productId === productId ? { ...l, quantity } : l)));
      if (userId) {
        await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("user_id", userId)
          .eq("product_id", productId);
      }
    },
    [raw, persist, userId],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      await persist(raw.filter((l) => l.productId !== productId));
      if (userId) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);
      }
    },
    [raw, persist, userId],
  );

  const setSavedForLater = useCallback(
    async (productId: string, saved: boolean) => {
      await persist(
        raw.map((l) => (l.productId === productId ? { ...l, savedForLater: saved } : l)),
      );
      if (userId) {
        await supabase
          .from("cart_items")
          .update({ saved_for_later: saved })
          .eq("user_id", userId)
          .eq("product_id", productId);
      }
    },
    [raw, persist, userId],
  );

  const clearCart = useCallback(async () => {
    await persist([]);
    if (userId) await supabase.from("cart_items").delete().eq("user_id", userId);
  }, [persist, userId]);

  const lines = useMemo<CartLine[]>(
    () =>
      raw
        .filter((l) => products[l.productId])
        .map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          savedForLater: l.savedForLater,
          product: products[l.productId]!,
        })),
    [raw, products],
  );

  const activeLines = useMemo(() => lines.filter((l) => !l.savedForLater), [lines]);
  const savedLines = useMemo(() => lines.filter((l) => l.savedForLater), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      activeLines,
      savedLines,
      count: activeLines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: activeLines.reduce((sum, l) => sum + effectivePrice(l.product) * l.quantity, 0),
      loading,
      addItem,
      setQuantity,
      removeItem,
      setSavedForLater,
      clearCart,
      isInCart: (productId: string) => raw.some((l) => l.productId === productId),
    }),
    [
      lines,
      activeLines,
      savedLines,
      loading,
      addItem,
      setQuantity,
      removeItem,
      setSavedForLater,
      clearCart,
      raw,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
