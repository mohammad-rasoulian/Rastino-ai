"use client";

import { useEffect, useState } from "react";

type AdminSetting = {
  id: string;
  key: string;
  label: string;
  group: string;
  type: string;
  value: string;
};

function isEnabled(value: string) {
  return value === "true";
}

function settingDescription(key: string) {
  const descriptions: Record<string, string> = {
    "settings.maintenanceMode":
      "وقتی فعال شود، در فاز بعد می‌توانیم سایت را برای کاربران عادی موقتاً ببندیم.",
    "settings.registrationEnabled":
      "برای کنترل باز یا بسته بودن ثبت‌نام عمومی کاربران.",
    "settings.chatEnabled":
      "برای فعال یا غیرفعال کردن قابلیت چت در کل محصول.",
    "settings.imageStudioEnabled":
      "برای کنترل دسترسی کاربران به بخش تولید تصویر.",
    "settings.openRouterMode":
      "mock یعنی پاسخ آزمایشی؛ real یعنی اتصال واقعی به OpenRouter در production.",
    "settings.smsMode":
      "mock یعنی OTP آزمایشی؛ real یعنی اتصال به سرویس پیامکی واقعی.",
    "settings.publicBanner":
      "پیامی که بعداً می‌توانیم بالای اپ یا صفحه اصلی برای کاربران نمایش بدهیم.",
  };

  return descriptions[key] || "تنظیم عمومی محصول.";
}

export function SettingsView() {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "دریافت تنظیمات ناموفق بود.");
        return;
      }

      setSettings(data.settings || []);
    } finally {
      setLoading(false);
    }
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value } : item))
    );
  }

  async function saveSettings() {
    const confirmed = window.confirm(
      "مطمئنی می‌خوای تنظیمات اصلی محصول را ذخیره کنی؟"
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: settings.map((item) => ({
            key: item.key,
            value: item.value,
          })),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "ذخیره تنظیمات ناموفق بود.");
        return;
      }

      setSettings(data.settings || []);
      alert("تنظیمات محصول ذخیره شد.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="admin-card text-sm r-muted">در حال بارگذاری تنظیمات...</div>;
  }

  return (
    <div className="space-y-4">
      <section className="admin-hero-card">
        <p className="text-xs r-muted">Product Control Room</p>
        <h3 className="mt-1 text-2xl font-black">تنظیمات کل محصول</h3>
        <p className="mt-3 text-sm leading-7 r-muted">
          از اینجا حالت کلی راستینو را کنترل کن: ثبت‌نام، چت، تصویر، API واقعی، پیامک و پیام عمومی.
        </p>
      </section>

      <div className="grid gap-3">
        {settings.map((setting) => (
          <section key={setting.key} className="admin-card">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black">{setting.label}</p>
                <p className="mt-2 text-xs leading-6 r-muted">
                  {settingDescription(setting.key)}
                </p>
                <p className="mt-2 text-[10px] r-muted" dir="ltr">
                  {setting.key}
                </p>
              </div>

              {setting.type === "boolean" && (
                <button
                  type="button"
                  onClick={() =>
                    updateSetting(
                      setting.key,
                      isEnabled(setting.value) ? "false" : "true"
                    )
                  }
                  className={`rounded-2xl px-4 py-2 text-xs font-black ${
                    isEnabled(setting.value) ? "r-pill-active" : "r-pill"
                  }`}
                >
                  {isEnabled(setting.value) ? "فعال" : "غیرفعال"}
                </button>
              )}
            </div>

            {setting.type === "select" && (
              <select
                value={setting.value}
                onChange={(event) => updateSetting(setting.key, event.target.value)}
                className="r-input w-full rounded-2xl p-3 text-sm outline-none"
              >
                <option value="mock">mock</option>
                <option value="real">real</option>
              </select>
            )}

            {setting.type === "textarea" && (
              <textarea
                value={setting.value}
                onChange={(event) => updateSetting(setting.key, event.target.value)}
                rows={4}
                placeholder="مثلاً: راستینو در نسخه آزمایشی قرار دارد..."
                className="r-input w-full resize-none rounded-2xl p-3 text-sm leading-7 outline-none"
              />
            )}

            {setting.type === "text" && (
              <input
                value={setting.value}
                onChange={(event) => updateSetting(setting.key, event.target.value)}
                className="r-input w-full rounded-2xl p-3 text-sm outline-none"
              />
            )}
          </section>
        ))}
      </div>

      <button
        onClick={saveSettings}
        disabled={saving}
        className="auth-main-action"
      >
        {saving ? "در حال ذخیره تنظیمات..." : "ذخیره تنظیمات محصول"}
      </button>
    </div>
  );
}
