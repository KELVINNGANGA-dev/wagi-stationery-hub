import type { Database } from "@/integrations/supabase/types";

export type Tables = Database["public"]["Tables"];
export type Enums = Database["public"]["Enums"];

export type Category = Tables["categories"]["Row"];
export type Product = Tables["products"]["Row"];
export type ProductImage = Tables["product_images"]["Row"];
export type CartItemRow = Tables["cart_items"]["Row"];
export type Order = Tables["orders"]["Row"];
export type OrderItem = Tables["order_items"]["Row"];
export type OrderStatusHistory = Tables["order_status_history"]["Row"];
export type Payment = Tables["payments"]["Row"];
export type Profile = Tables["profiles"]["Row"];
export type Review = Tables["reviews"]["Row"];
export type Coupon = Tables["coupons"]["Row"];
export type Notification = Tables["notifications"]["Row"];
export type StoreSettings = Tables["store_settings"]["Row"];

export type OrderStatus = Enums["order_status"];
export type PaymentStatus = Enums["payment_status"];
export type PaymentMethod = Enums["payment_method"];

export type ProductWithCategory = Product & { categories: Pick<Category, "name" | "slug"> | null };

export type CartLine = {
  productId: string;
  quantity: number;
  savedForLater: boolean;
  product: Product;
};
