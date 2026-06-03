"use client";

import { useEffect, useState } from "react";
import {
  AppSettings,
  applyAppSettings,
  defaultAppSettings,
  loadAppSettings,
  saveAppSettings,
} from "@/lib/app-settings";

type OptionButtonProps<T extends string> = {
  value: T;
  activeValue: T;
  title: string;
  description: string;
  onClick: (value: T) => void;
};

function OptionButton<T extends string>({
  value,
  activeValue,
  title,
  description,
  onClick,
}: OptionButtonProps<T>) {
  const active = value === activeValue;

  return (
    <button
      onClick={() => onClick(value)}
      className={`settings-option ${active ? "settings-option-active" : ""}`}
    >
      <span className="block text-sm font-black">{title}</span>
      <span className={`mt-1 block text-xs leading-6 ${active ? "text-black/60" : "r-muted"}`}>
        {description}
      </span>
    </button>
  );
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);

  useEffect(() => {
    const loaded = loadAppSettings();
    setSettings(loaded);
    applyAppSettings(loaded);
  }, []);

  function updateSettings(next: AppSettings) {
    setSettings(next);
    saveAppSettings(next);
    applyAppSettings(next);
  }

  function resetSettings() {
    updateSettings(defaultAppSettings);
  }

  return (
    <div className="space-y-5">
      <section className="settings-hero-card">
        <p className="text-xs r-muted">Rastino Preferences</p>
        <h3 className="mt-1 text-2xl font-black">تنظیمات راستینو</h3>
        <p className="mt-3 text-sm leading-7 r-muted">
          ظاهر، خوانایی و حس کار با راستینو را شخصی‌سازی کن. تغییرات همین لحظه روی کل سایت اعمال می‌شوند.
        </p>
      </section>

      <section className="settings-panel-card">
        <div className="mb-4">
          <p className="text-base font-black">تم سایت</p>
          <p className="mt-1 text-xs r-muted">حالت تاریک، روشن یا هماهنگ با سیستم</p>
        </div>

        <div className="grid gap-3">
          <OptionButton
            value="dark"
            activeValue={settings.theme}
            title="تاریک"
            description="ظاهر مشکی و مینیمال فعلی راستینو"
            onClick={(theme) => updateSettings({ ...settings, theme })}
          />

          <OptionButton
            value="light"
            activeValue={settings.theme}
            title="روشن"
            description="تم سفید، تمیز و مناسب استفاده طولانی"
            onClick={(theme) => updateSettings({ ...settings, theme })}
          />

          <OptionButton
            value="system"
            activeValue={settings.theme}
            title="سیستم"
            description="هماهنگ با تنظیمات دستگاه"
            onClick={(theme) => updateSettings({ ...settings, theme })}
          />
        </div>
      </section>

      <section className="settings-panel-card">
        <div className="mb-4">
          <p className="text-base font-black">اندازه متن</p>
          <p className="mt-1 text-xs r-muted">برای خوانایی بهتر جواب‌ها</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <OptionButton
            value="normal"
            activeValue={settings.textSize}
            title="معمولی"
            description="اندازه استاندارد"
            onClick={(textSize) => updateSettings({ ...settings, textSize })}
          />

          <OptionButton
            value="large"
            activeValue={settings.textSize}
            title="درشت"
            description="مناسب استفاده راحت‌تر"
            onClick={(textSize) => updateSettings({ ...settings, textSize })}
          />
        </div>
      </section>

      <section className="settings-panel-card">
        <div className="mb-4">
          <p className="text-base font-black">تراکم رابط</p>
          <p className="mt-1 text-xs r-muted">فاصله‌ها و اندازه آیتم‌ها</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <OptionButton
            value="comfortable"
            activeValue={settings.density}
            title="راحت"
            description="فاصله‌های بیشتر"
            onClick={(density) => updateSettings({ ...settings, density })}
          />

          <OptionButton
            value="compact"
            activeValue={settings.density}
            title="فشرده"
            description="نمایش اطلاعات بیشتر"
            onClick={(density) => updateSettings({ ...settings, density })}
          />
        </div>
      </section>

      <section className="settings-panel-card">
        <div className="mb-4">
          <p className="text-base font-black">انیمیشن‌ها</p>
          <p className="mt-1 text-xs r-muted">برای سیستم‌های ضعیف‌تر می‌توانی کمترش کنی</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <OptionButton
            value="on"
            activeValue={settings.motion}
            title="روشن"
            description="افکت‌های نرم"
            onClick={(motion) => updateSettings({ ...settings, motion })}
          />

          <OptionButton
            value="reduced"
            activeValue={settings.motion}
            title="کمتر"
            description="حداقل حرکت"
            onClick={(motion) => updateSettings({ ...settings, motion })}
          />
        </div>
      </section>

      <button onClick={resetSettings} className="settings-reset-button">
        بازگشت به تنظیمات پیش‌فرض
      </button>
    </div>
  );
}
