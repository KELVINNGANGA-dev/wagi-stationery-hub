/**
 * M-Pesa Daraja service layer (server-only).
 *
 * The store is not yet live on Daraja, so `isMpesaConfigured()` returns false
 * and checkout falls back to "pay manually / cash on delivery". Once the
 * MPESA_* environment variables are supplied the STK push flow below works
 * without any UI changes.
 */

type DarajaEnv = {
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
  baseUrl: string;
};

export function readDarajaEnv(): DarajaEnv | null {
  const consumerKey = process.env["MPESA_CONSUMER_KEY"];
  const consumerSecret = process.env["MPESA_CONSUMER_SECRET"];
  const shortcode = process.env["MPESA_SHORTCODE"];
  const passkey = process.env["MPESA_PASSKEY"];
  const callbackUrl = process.env["MPESA_CALLBACK_URL"];
  if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) return null;
  return {
    consumerKey,
    consumerSecret,
    shortcode,
    passkey,
    callbackUrl,
    baseUrl:
      process.env["MPESA_ENVIRONMENT"] === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke",
  };
}

async function getAccessToken(env: DarajaEnv): Promise<string> {
  const auth = btoa(`${env.consumerKey}:${env.consumerSecret}`);
  const res = await fetch(`${env.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error("Could not authenticate with M-Pesa");
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(
    d.getMinutes(),
  )}${pad(d.getSeconds())}`;
}

export type StkPushResult = {
  merchantRequestId: string;
  checkoutRequestId: string;
  customerMessage: string;
};

/** Initiates a Lipa Na M-Pesa Online (STK push) request. */
export async function stkPush(args: {
  phone: string;
  amount: number;
  orderNumber: string;
}): Promise<StkPushResult> {
  const env = readDarajaEnv();
  if (!env) throw new Error("M-Pesa is not configured yet");

  const token = await getAccessToken(env);
  const ts = timestamp();
  const password = btoa(`${env.shortcode}${env.passkey}${ts}`);

  const res = await fetch(`${env.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: env.shortcode,
      Password: password,
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.max(1, Math.round(args.amount)),
      PartyA: args.phone,
      PartyB: env.shortcode,
      PhoneNumber: args.phone,
      CallBackURL: env.callbackUrl,
      AccountReference: args.orderNumber,
      TransactionDesc: `Payment for ${args.orderNumber}`,
    }),
  });

  const json = (await res.json()) as Record<string, string>;
  if (!res.ok || !json["CheckoutRequestID"]) {
    throw new Error(json["errorMessage"] ?? "M-Pesa request failed");
  }
  return {
    merchantRequestId: json["MerchantRequestID"] ?? "",
    checkoutRequestId: json["CheckoutRequestID"],
    customerMessage: json["CustomerMessage"] ?? "Check your phone to complete payment",
  };
}
