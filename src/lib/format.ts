import { STORE } from "./store-config";

const formatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: STORE.currency,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formats a number as Kenyan Shillings, e.g. KES 1,950. */
export function formatPrice(value: number | string | null | undefined): string {
  const amount = typeof value === "string" ? Number(value) : (value ?? 0);
  if (!Number.isFinite(amount)) return formatter.format(0);
  return formatter.format(amount);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** The price a customer actually pays. */
export function effectivePrice(product: {
  price: number | string;
  discount_price?: number | string | null;
}): number {
  const price = Number(product.price) || 0;
  const discount = product.discount_price == null ? null : Number(product.discount_price);
  return discount != null && discount > 0 && discount < price ? discount : price;
}

export function discountPercent(product: {
  price: number | string;
  discount_price?: number | string | null;
}): number | null {
  const price = Number(product.price) || 0;
  const discount = product.discount_price == null ? null : Number(product.discount_price);
  if (discount == null || discount <= 0 || discount >= price) return null;
  return Math.round(((price - discount) / price) * 100);
}

/** Normalises a Kenyan phone number to the 2547XXXXXXXX format used by M-Pesa. */
export function normalizeKenyanPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (/^254(7|1)\d{8}$/.test(digits)) return digits;
  if (/^0(7|1)\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^(7|1)\d{8}$/.test(digits)) return `254${digits}`;
  return null;
}
