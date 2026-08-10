import { Link } from "@tanstack/react-router";
import { Grid2x2, Heart, Home, Package, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";

/** Mobile-first bottom navigation bar. */
export function BottomNav() {
  const { count } = useCart();
  const activeCls = { className: "text-primary" };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5">
        <Link
          to="/"
          activeOptions={{ exact: true }}
          activeProps={activeCls}
          className="flex flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium text-muted-foreground"
        >
          <Home className="size-5" />
          Home
        </Link>
        <Link
          to="/categories"
          activeProps={activeCls}
          className="flex flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium text-muted-foreground"
        >
          <Grid2x2 className="size-5" />
          Shop
        </Link>
        <Link
          to="/cart"
          activeProps={activeCls}
          className="relative flex flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium text-muted-foreground"
        >
          <span className="relative">
            <ShoppingCart className="size-5" />
            {count > 0 && (
              <Badge className="absolute -right-2 -top-1.5 size-4 justify-center rounded-full p-0 text-[0.6rem]">
                {count > 9 ? "9+" : count}
              </Badge>
            )}
          </span>
          Cart
        </Link>
        <Link
          to="/wishlist"
          activeProps={activeCls}
          className="flex flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium text-muted-foreground"
        >
          <Heart className="size-5" />
          Saved
        </Link>
        <Link
          to="/orders"
          activeProps={activeCls}
          className="flex flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium text-muted-foreground"
        >
          <Package className="size-5" />
          Orders
        </Link>
      </div>
    </nav>
  );
}
