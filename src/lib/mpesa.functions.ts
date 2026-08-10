import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Tells the storefront whether live M-Pesa STK push is available yet. */
export const getMpesaStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { readDarajaEnv } = await import("@/lib/mpesa.server");
  return { enabled: readDarajaEnv() !== null };
});

/**
 * Starts an M-Pesa STK push for an order the signed-in user owns.
 * Returns a friendly "coming soon" result while Daraja credentials are absent.
 */
export const startMpesaPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string; phone: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(input.orderId)) throw new Error("Invalid order");
    if (!/^254(7|1)\d{8}$/.test(input.phone)) throw new Error("Invalid phone number");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, total, user_id")
      .eq("id", data.orderId)
      .maybeSingle();
    if (error || !order || order.user_id !== userId) throw new Error("Order not found");

    const { readDarajaEnv, stkPush } = await import("@/lib/mpesa.server");
    if (readDarajaEnv() === null) {
      return {
        status: "unavailable" as const,
        message: "M-Pesa checkout is coming soon. Please pay on delivery for now.",
      };
    }

    const result = await stkPush({
      phone: data.phone,
      amount: Number(order.total),
      orderNumber: order.order_number,
    });

    await supabase
      .from("payments")
      .update({
        mpesa_checkout_request_id: result.checkoutRequestId,
        mpesa_merchant_request_id: result.merchantRequestId,
        status: "pending",
        phone: data.phone,
      })
      .eq("order_id", order.id);

    return { status: "pending" as const, message: result.customerMessage };
  });
