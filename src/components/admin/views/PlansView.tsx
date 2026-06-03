"use client";

import type { FormEvent } from "react";
import type { AdminPlan } from "../admin-types";

type PlansViewProps = {
  plans: AdminPlan[];
  onPlanUpdated: () => void;
};

export function PlansView({ plans, onPlanUpdated }: PlansViewProps) {
  async function updatePlan(event: FormEvent<HTMLFormElement>, plan: AdminPlan) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const payload = {
      id: plan.id,
      name: String(form.get("name") || ""),
      description: String(form.get("description") || ""),
      price: Number(form.get("price") || 0),
      monthlyMessages: Number(form.get("monthlyMessages") || 0),
      dailyMessages: Number(form.get("dailyMessages") || 0),
      maxInputTokens: Number(form.get("maxInputTokens") || 0),
      maxOutputTokens: Number(form.get("maxOutputTokens") || 0),
      priority: Number(form.get("priority") || 0),
      allowFiles: form.get("allowFiles") === "on",
      allowImages: form.get("allowImages") === "on",
      allowOcr: form.get("allowOcr") === "on",
      isActive: form.get("isActive") === "on",
    };

    const res = await fetch("/api/admin/plans", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error || "ذخیره پلن ناموفق بود.");
      return;
    }

    alert("پلن ذخیره شد.");
    onPlanUpdated();
  }

  return (
    <div className="space-y-4">
      <section className="admin-hero-card">
        <p className="text-xs r-muted">Plans Control</p>
        <h3 className="mt-1 text-2xl font-black">کنترل پلن‌ها و محدودیت‌ها</h3>
        <p className="mt-3 text-sm leading-7 r-muted">
          قیمت، تعداد پیام، محدودیت توکن و امکانات هر پلن را از اینجا کنترل کن.
        </p>
      </section>

      {plans.map((plan) => (
        <form
          key={plan.id}
          onSubmit={(event) => updatePlan(event, plan)}
          className="admin-card space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-black">{plan.key}</p>
              <p className="mt-1 text-xs r-muted" dir="ltr">
                {plan.id}
              </p>
            </div>

            <label className="admin-badge flex items-center gap-2">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked={plan.isActive}
              />
              فعال
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="name"
              defaultValue={plan.name}
              className="r-input rounded-2xl p-3 text-sm outline-none"
              placeholder="نام پلن"
            />

            <input
              name="price"
              type="number"
              defaultValue={plan.price}
              className="r-input rounded-2xl p-3 text-sm outline-none"
              placeholder="قیمت"
            />

            <input
              name="monthlyMessages"
              type="number"
              defaultValue={plan.monthlyMessages}
              className="r-input rounded-2xl p-3 text-sm outline-none"
              placeholder="پیام ماهانه"
            />

            <input
              name="dailyMessages"
              type="number"
              defaultValue={plan.dailyMessages}
              className="r-input rounded-2xl p-3 text-sm outline-none"
              placeholder="پیام روزانه"
            />

            <input
              name="maxInputTokens"
              type="number"
              defaultValue={plan.maxInputTokens}
              className="r-input rounded-2xl p-3 text-sm outline-none"
              placeholder="حداکثر ورودی"
            />

            <input
              name="maxOutputTokens"
              type="number"
              defaultValue={plan.maxOutputTokens}
              className="r-input rounded-2xl p-3 text-sm outline-none"
              placeholder="حداکثر خروجی"
            />

            <input
              name="priority"
              type="number"
              defaultValue={plan.priority}
              className="r-input rounded-2xl p-3 text-sm outline-none"
              placeholder="اولویت"
            />

            <input
              name="description"
              defaultValue={plan.description || ""}
              className="r-input rounded-2xl p-3 text-sm outline-none"
              placeholder="توضیح"
            />
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <label className="r-pill rounded-xl px-3 py-2">
              <input name="allowFiles" type="checkbox" defaultChecked={plan.allowFiles} /> فایل
            </label>

            <label className="r-pill rounded-xl px-3 py-2">
              <input name="allowImages" type="checkbox" defaultChecked={plan.allowImages} /> تصویر
            </label>

            <label className="r-pill rounded-xl px-3 py-2">
              <input name="allowOcr" type="checkbox" defaultChecked={plan.allowOcr} /> OCR
            </label>
          </div>

          <button className="auth-main-action">ذخیره پلن</button>
        </form>
      ))}
    </div>
  );
}
