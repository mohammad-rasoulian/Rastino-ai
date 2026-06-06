"use client";

import { useState } from "react";
import type { PlanId } from "@/lib/billing/plans";

type PlanPurchaseButtonProps = {
  planId: PlanId;
  priceToman: number;
};

export function PlanPurchaseButton({
  planId,
  priceToman,
}: PlanPurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function startPayment() {
    setMessage("");

    if (planId === "free" || priceToman <= 0) {
      window.location.href = "/app";
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/payments/zibal/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          planId,
        }),
      });

      const rawText = await res.text();
      let data: { redirectUrl?: string; error?: string } | null = null;

      try {
        data = rawText ? (JSON.parse(rawText) as { redirectUrl?: string; error?: string }) : null;
      } catch {
        data = null;
      }

      console.log("[ZIBAL PAYMENT RESPONSE]", {
        status: res.status,
        ok: res.ok,
        rawText,
        data,
      });

      if (res.status === 401) {
        setMessage("برای خرید پلن، اول وارد حساب کاربری شو. اگر وارد شدی، صفحه را رفرش کن و دوباره امتحان کن.");
        return;
      }

      if (!res.ok) {
        setMessage(data?.error || rawText || `شروع پرداخت ناموفق بود. کد خطا: ${res.status}`);
        return;
      }

      if (!data?.redirectUrl) {
        setMessage("درگاه آدرس پرداخت برنگرداند. Console مرورگر را بررسی کن.");
        return;
      }

      window.location.assign(data.redirectUrl);
    } catch (error) {
      console.error("[ZIBAL PAYMENT CLIENT ERROR]", error);
      setMessage("اتصال به درگاه ناموفق بود. Console مرورگر را بررسی کن.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={startPayment}
        disabled={loading}
        style={{ backgroundColor: "#ffffff", color: "#000000" }}
        className="w-full rounded-2xl border border-white bg-white px-5 py-4 text-sm font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.12)] transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "در حال انتقال به درگاه..."
          : planId === "free"
            ? "شروع رایگان"
            : "خرید و پرداخت امن"}
      </button>

      {message && (
        <p className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs leading-6 text-red-100">
          {message}
        </p>
      )}
    </div>
  );
}
