import type { PlanId } from "@/lib/billing/plans";

const ZIBAL_GATEWAY_BASE = "https://gateway.zibal.ir";

export type ZibalRequestResponse = {
  result: number;
  message: string;
  trackId?: number;
};

export type ZibalVerifyResponse = {
  result: number;
  message: string;
  paidAt?: string;
  amount?: number;
  status?: number;
  refNumber?: number;
  cardNumber?: string;
  orderId?: string;
};

export type ZibalTransactionMeta = {
  kind: "subscription";
  planId: PlanId;
  userId: string;
  orderId: string;
  amountRial: number;
  amountToman: number;
  createdAt: string;
  verifiedAt?: string;
  zibal?: unknown;
};

export function getZibalMerchant() {
  const merchant = process.env.ZIBAL_MERCHANT || "zibal";
  return merchant.trim() || "zibal";
}

export function getPaymentBaseUrl() {
  const raw =
    process.env.ZIBAL_CALLBACK_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000";

  return raw.replace(/\/+$/, "");
}

export function getZibalCallbackUrl() {
  return `${getPaymentBaseUrl()}/api/payments/zibal/callback`;
}

export function getZibalStartUrl(trackId: string | number) {
  return `${ZIBAL_GATEWAY_BASE}/start/${trackId}`;
}

async function postToZibal<T>(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${ZIBAL_GATEWAY_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => null)) as T | null;

  if (!res.ok || !data) {
    throw new Error(`Zibal request failed: HTTP ${res.status}`);
  }

  return data;
}

export async function requestZibalPayment(args: {
  amountRial: number;
  orderId: string;
  description: string;
  mobile?: string | null;
}) {
  return postToZibal<ZibalRequestResponse>("/v1/request", {
    merchant: getZibalMerchant(),
    amount: args.amountRial,
    callbackUrl: getZibalCallbackUrl(),
    description: args.description,
    orderId: args.orderId,
    mobile: args.mobile || undefined,
  });
}

export async function verifyZibalPayment(trackId: string | number) {
  return postToZibal<ZibalVerifyResponse>("/v1/verify", {
    merchant: getZibalMerchant(),
    trackId: Number(trackId),
  });
}

export function parseZibalTransactionMeta(value?: string | null) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<ZibalTransactionMeta>;

    if (
      parsed.kind === "subscription" &&
      (parsed.planId === "plus" || parsed.planId === "pro") &&
      typeof parsed.userId === "string" &&
      typeof parsed.orderId === "string"
    ) {
      return parsed as ZibalTransactionMeta;
    }

    return null;
  } catch {
    return null;
  }
}

export function stringifyZibalMeta(meta: ZibalTransactionMeta) {
  return JSON.stringify(meta);
}
