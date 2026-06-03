"use client";

import { useEffect, useState } from "react";

type SiteContentItem = {
  id: string;
  key: string;
  label: string;
  group: string;
  type: string;
  value: string;
};

function groupItems(items: SiteContentItem[]) {
  return items.reduce<Record<string, SiteContentItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});
}

export function SiteContentManager() {
  const [items, setItems] = useState<SiteContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    setLoading(true);

    try {
      const res = await fetch("/api/site-content", {
        credentials: "include",
      });

      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  function updateValue(key: string, value: string) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value } : item))
    );
  }

  async function saveContent() {
    setSaving(true);

    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            key: item.key,
            value: item.value,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "ذخیره متن‌ها ناموفق بود.");
        return;
      }

      alert("متن‌های سایت ذخیره شدند.");
      await loadContent();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="admin-card text-sm r-muted">در حال بارگذاری متن‌ها...</div>;
  }

  const groups = groupItems(items);

  return (
    <div className="space-y-5">
      <section className="admin-hero-card">
        <p className="text-xs r-muted">Mini CMS</p>
        <h3 className="mt-1 text-2xl font-black">ویرایش متن سایت</h3>
        <p className="mt-3 text-sm leading-7 r-muted">
          متن‌های اصلی سایت را از اینجا تغییر بده. تغییرات بعد از ذخیره برای همه کاربران اعمال می‌شود.
        </p>
      </section>

      {Object.entries(groups).map(([group, groupItems]) => (
        <section key={group} className="admin-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-base font-black">
                {group === "home" ? "صفحه اصلی" : group === "auth" ? "صفحه ورود" : group}
              </p>
              <p className="mt-1 text-xs r-muted">{groupItems.length} متن قابل ویرایش</p>
            </div>
          </div>

          <div className="space-y-4">
            {groupItems.map((item) => (
              <div key={item.key}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-sm font-black">{item.label}</label>
                  <span dir="ltr" className="rounded-full bg-white/5 px-2 py-1 text-[10px] r-muted">
                    {item.key}
                  </span>
                </div>

                {item.type === "textarea" ? (
                  <textarea
                    value={item.value}
                    onChange={(event) => updateValue(item.key, event.target.value)}
                    rows={4}
                    className="r-input w-full resize-none rounded-2xl p-3 text-sm leading-7 outline-none"
                  />
                ) : (
                  <input
                    value={item.value}
                    onChange={(event) => updateValue(item.key, event.target.value)}
                    className="r-input w-full rounded-2xl p-3 text-sm outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <button
        onClick={saveContent}
        disabled={saving}
        className="auth-main-action"
      >
        {saving ? "در حال ذخیره..." : "ذخیره تغییرات متن سایت"}
      </button>
    </div>
  );
}
