"use client";

import type { FormEvent } from "react";
import type { AdminPromptTemplate } from "../admin-types";

type PromptsViewProps = {
  prompts: AdminPromptTemplate[];
  onPromptUpdated: () => void;
};

export function PromptsView({ prompts, onPromptUpdated }: PromptsViewProps) {
  async function updatePrompt(
    event: FormEvent<HTMLFormElement>,
    prompt: AdminPromptTemplate
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const payload = {
      id: prompt.id,
      title: String(form.get("title") || ""),
      category: String(form.get("category") || "general"),
      description: String(form.get("description") || ""),
      content: String(form.get("content") || ""),
      isActive: form.get("isActive") === "on",
    };

    const res = await fetch("/api/admin/prompts", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error || "ذخیره پرامپت ناموفق بود.");
      return;
    }

    alert("پرامپت ذخیره شد.");
    onPromptUpdated();
  }

  return (
    <div className="space-y-4">
      <section className="admin-hero-card">
        <p className="text-xs r-muted">Prompt Engine</p>
        <h3 className="mt-1 text-2xl font-black">کنترل پرامپت‌ها</h3>
        <p className="mt-3 text-sm leading-7 r-muted">
          رفتارهای اصلی راستینو، قالب‌های پاسخ و پرامپت‌های آماده را از اینجا کنترل کن.
        </p>
      </section>

      {prompts.map((prompt) => (
        <form
          key={prompt.id}
          onSubmit={(event) => updatePrompt(event, prompt)}
          className="admin-card space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-black">{prompt.key}</p>
              <p className="mt-1 text-xs r-muted">{prompt.category}</p>
            </div>

            <label className="admin-badge flex items-center gap-2">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked={prompt.isActive}
              />
              فعال
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="title"
              defaultValue={prompt.title}
              className="r-input rounded-2xl p-3 text-sm outline-none"
              placeholder="عنوان"
            />

            <input
              name="category"
              defaultValue={prompt.category}
              className="r-input rounded-2xl p-3 text-sm outline-none"
              placeholder="دسته"
            />
          </div>

          <input
            name="description"
            defaultValue={prompt.description || ""}
            className="r-input w-full rounded-2xl p-3 text-sm outline-none"
            placeholder="توضیح"
          />

          <textarea
            name="content"
            defaultValue={prompt.content}
            rows={9}
            className="r-input w-full resize-y rounded-2xl p-3 text-sm leading-7 outline-none"
            placeholder="متن پرامپت"
          />

          <button className="auth-main-action">ذخیره پرامپت</button>
        </form>
      ))}
    </div>
  );
}
