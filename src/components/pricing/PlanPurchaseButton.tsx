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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        setMessage("برای خرید پلن، اول وارد حساب کاربری شو.");
        window.location.href = "/app";
        return;
      }

      if (!res.ok || !data?.redirectUrl) {
        setMessage(data?.error || "شروع پرداخت ناموفق بود.");
        return;
      }

      window.location.href = data.redirectUrl;
    } catch {
      setMessage("اتصال به درگاه ناموفق بود. دوباره تلاش کن.");
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
        className="w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
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
