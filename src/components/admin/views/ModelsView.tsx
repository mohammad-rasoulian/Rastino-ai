"use client";

import { useEffect, useMemo, useState } from "react";
import type { RastinoPlanTier } from "@/lib/ai/model-catalog";

type AdminModel = {
  id: string;
  label: string;
  short: string;
  provider: string;
  tier: RastinoPlanTier;
  role: string;
  creditCost: number;
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
  estimatedCostIrr: number;
  isDefault: boolean;
};

type DefaultModels = Record<RastinoPlanTier, string>;

const planLabels: Record<RastinoPlanTier, string> = {
  free: "رایگان",
  plus: "پلاس",
  pro: "پرو",
};

const planDescriptions: Record<RastinoPlanTier, string> = {
  free: "۵ مدل ارزان و کم‌ریسک برای جذب کاربر و تست اولیه.",
  plus: "۵ مدل متعادل برای کاربرهای روزمره با هزینه کنترل‌شده.",
  pro: "۵ مدل حرفه‌ای برای خروجی جدی، تحلیل و کارهای سنگین.",
};

export function ModelsView() {
  const [models, setModels] = useState<AdminModel[]>([]);
  const [defaultModels, setDefaultModels] = useState<DefaultModels>({
    free: "",
    plus: "",
    pro: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingModelId, setSavingModelId] = useState<string | null>(null);

  const groupedModels = useMemo(() => {
    return {
      free: models.filter((model) => model.tier === "free"),
      plus: models.filter((model) => model.tier === "plus"),
      pro: models.filter((model) => model.tier === "pro"),
    };
  }, [models]);

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/models", {
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "دریافت مدل‌ها ناموفق بود.");
        return;
      }

      setModels(data.models || []);
      setDefaultModels(data.defaultModels || {});
    } finally {
      setLoading(false);
    }
  }

  async function copyModelId(modelId: string) {
    await navigator.clipboard.writeText(modelId);
    alert(`کپی شد: ${modelId}`);
  }

  async function setDefaultModel(plan: RastinoPlanTier, modelId: string) {
    const confirmed = window.confirm(
      `این مدل به عنوان پیش‌فرض پلن ${planLabels[plan]} تنظیم شود؟`
    );

    if (!confirmed) return;

    setSavingModelId(modelId);

    try {
      const res = await fetch("/api/admin/models", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          modelId,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "تغییر مدل پیش‌فرض ناموفق بود.");
        return;
      }

      setDefaultModels(data.defaultModels);
      await loadModels();
    } finally {
      setSavingModelId(null);
    }
  }

  if (loading) {
    return <div className="admin-card text-sm r-muted">در حال بارگذاری مدل‌ها...</div>;
  }

  return (
    <div className="space-y-4">
      <section className="admin-hero-card">
        <p className="text-xs r-muted">AI Model Catalog</p>
        <h3 className="mt-1 text-2xl font-black">مدیریت مدل‌های هوش مصنوعی</h3>
        <p className="mt-3 text-sm leading-7 r-muted">
          اینجا اسم واقعی API هر مدل، پلن، هزینه اعتباری و مدل پیش‌فرض هر اشتراک را کنترل می‌کنی.
        </p>
      </section>

      {(["free", "plus", "pro"] as RastinoPlanTier[]).map((plan) => (
        <section key={plan} className="admin-card">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xl font-black">پلن {planLabels[plan]}</p>
              <p className="mt-2 text-sm leading-7 r-muted">
                {planDescriptions[plan]}
              </p>
            </div>

            <div className="rounded-2xl border border-[#242424] bg-[#111] px-4 py-3 text-xs">
              <p className="r-muted">مدل پیش‌فرض</p>
              <p className="mt-1 font-black" dir="ltr">
                {defaultModels[plan] || "-"}
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {groupedModels[plan].map((model) => (
              <article
                key={model.id}
                className={`rounded-3xl border p-4 ${
                  defaultModels[plan] === model.id
                    ? "border-zinc-100 bg-white/[0.06]"
                    : "border-[#242424] bg-[#101010]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-black">{model.label}</h4>
                      <span className="admin-badge">{model.provider}</span>
                      <span className="admin-badge">{model.creditCost} اعتبار</span>
                      {defaultModels[plan] === model.id && (
                        <span className="admin-badge text-emerald-300">
                          پیش‌فرض
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-7 r-muted">
                      {model.role}
                    </p>

                    <div className="mt-3 rounded-2xl border border-[#242424] bg-black/20 px-3 py-2">
                      <p className="text-[11px] r-muted">شناسه واقعی API</p>
                      <code className="mt-1 block text-xs text-zinc-100" dir="ltr">
                        {model.id}
                      </code>
                    </div>
                  </div>

                  <div className="grid min-w-[180px] gap-2">
                    <div className="admin-mini-stat">
                      <span>هزینه تقریبی</span>
                      <b>{model.estimatedCostIrr.toLocaleString("fa-IR")} تومان</b>
                    </div>

                    <div className="admin-mini-stat">
                      <span>Input / Output</span>
                      <b dir="ltr">
                        ${model.inputUsdPerMillion} / ${model.outputUsdPerMillion}
                      </b>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyModelId(model.id)}
                    className="auth-secondary-button h-10 rounded-2xl px-4 text-xs font-black"
                  >
                    کپی شناسه API
                  </button>

                  <button
                    type="button"
                    disabled={savingModelId === model.id}
                    onClick={() => setDefaultModel(plan, model.id)}
                    className="auth-main-action h-10 rounded-2xl px-4 text-xs"
                  >
                    {savingModelId === model.id
                      ? "در حال ذخیره..."
                      : "انتخاب به عنوان پیش‌فرض"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
