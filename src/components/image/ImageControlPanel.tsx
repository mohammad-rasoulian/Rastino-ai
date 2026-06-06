"use client";

import type {
  AspectRatio,
  ImageBrandKit,
  ImageModelId,
  ImageModelInfo,
  ImageQuality,
} from "./types";
import {
  aspectRatios,
  brandTones,
  imageBoosts,
  imageModels,
  imagePresets,
  imageQualities,
  imageStyles,
  type ImageBoostId,
  type ImagePresetId,
} from "./image-data";

type ImageControlPanelProps = {
  prompt: string;
  setPrompt: (value: string) => void;

  negativePrompt: string;
  setNegativePrompt: (value: string) => void;

  selectedModel: ImageModelId;
  setSelectedModel: (value: ImageModelId) => void;

  style: string;
  setStyle: (value: string) => void;

  aspectRatio: AspectRatio;
  setAspectRatio: (value: AspectRatio) => void;

  quality: ImageQuality;
  setQuality: (value: ImageQuality) => void;

  imageCount: number;
  setImageCount: (value: number) => void;

  activeModel?: ImageModelInfo;
  isLoading: boolean;

  onImprovePrompt: () => void;
  onArchitectPrompt: () => void;
  onGenerateImage: () => void;

  selectedPresetId: ImagePresetId | null;
  onApplyPreset: (presetId: ImagePresetId) => void;
  onClearPreset: () => void;

  selectedBoostIds: ImageBoostId[];
  onToggleBoost: (boostId: ImageBoostId) => void;
  onClearBoosts: () => void;

  brandKit: ImageBrandKit;
  useBrandKit: boolean;
  setUseBrandKit: (value: boolean) => void;
  updateBrandKit: <K extends keyof ImageBrandKit>(
    key: K,
    value: ImageBrandKit[K]
  ) => void;
};

export function ImageControlPanel({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  selectedModel,
  setSelectedModel,
  style,
  setStyle,
  aspectRatio,
  setAspectRatio,
  quality,
  setQuality,
  imageCount,
  setImageCount,
  activeModel,
  isLoading,
  onImprovePrompt,
  onArchitectPrompt,
  onGenerateImage,
  selectedPresetId,
  onApplyPreset,
  onClearPreset,
  selectedBoostIds,
  onToggleBoost,
  onClearBoosts,
  brandKit,
  useBrandKit,
  setUseBrandKit,
  updateBrandKit,
}: ImageControlPanelProps) {
  return (
    <aside className="image-studio-panel hidden w-[430px] shrink-0 flex-col p-4 xl:flex">
      <div className="mb-4">
        <p className="text-xs r-muted">Image Studio Pro</p>
        <h3 className="mt-1 text-2xl font-black">استودیوی تصویر</h3>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="space-y-5">
          <section className="image-panel-section">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-black">Preset هوشمند</p>
                <p className="mt-1 text-xs r-muted">
                  هدف خروجی را انتخاب کن
                </p>
              </div>

              {selectedPresetId && (
                <button
                  onClick={onClearPreset}
                  className="rounded-full bg-white/5 px-3 py-1 text-[11px] r-muted"
                >
                  حذف
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {imagePresets.map((preset) => {
                const active = selectedPresetId === preset.id;

                return (
                  <button
                    key={preset.id}
                    onClick={() => onApplyPreset(preset.id)}
                    className={`image-pro-option ${
                      active ? "image-pro-option-active" : ""
                    }`}
                  >
                    <span className="font-black">{preset.title}</span>
                    <span className={active ? "text-black/60" : "r-muted"}>
                      {preset.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="image-panel-section">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-black">Creative Boost</p>
                <p className="mt-1 text-xs r-muted">
                  چند تقویت خلاقانه روی خروجی اعمال کن
                </p>
              </div>

              {selectedBoostIds.length > 0 && (
                <button
                  onClick={onClearBoosts}
                  className="rounded-full bg-white/5 px-3 py-1 text-[11px] r-muted"
                >
                  پاک کردن
                </button>
              )}
            </div>

            <div className="grid gap-2">
              {imageBoosts.map((boost) => {
                const active = selectedBoostIds.includes(boost.id);

                return (
                  <button
                    key={boost.id}
                    onClick={() => onToggleBoost(boost.id)}
                    className={`image-boost-row ${
                      active ? "image-boost-row-active" : ""
                    }`}
                  >
                    <span className="font-black">{boost.title}</span>
                    <span className={active ? "text-black/60" : "r-muted"}>
                      {boost.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="image-panel-section">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black">مدل تصویر</p>
              <span className="text-xs r-muted">{activeModel?.badge}</span>
            </div>

            <div className="space-y-2">
              {imageModels.map((model) => {
                const active = selectedModel === model.id;

                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`image-model-card ${
                      active ? "image-model-card-active" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black">{model.name}</p>
                        <p
                          className={`mt-1 text-xs leading-6 ${
                            active ? "text-black/60" : "r-muted"
                          }`}
                        >
                          {model.description}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2 py-1 text-[10px] ${
                          active
                            ? "bg-black/10 text-black"
                            : "bg-white/5 text-zinc-400"
                        }`}
                      >
                        {model.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="image-panel-section">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-black">Brand Kit</p>
                <p className="mt-1 text-xs r-muted">
                  اختیاری؛ برای هماهنگی تصویر با برند
                </p>
              </div>

              <button
                onClick={() => setUseBrandKit(!useBrandKit)}
                className={`rounded-full px-3 py-1 text-[11px] font-black ${
                  useBrandKit ? "r-pill-active" : "r-pill"
                }`}
              >
                {useBrandKit ? "فعال" : "غیرفعال"}
              </button>
            </div>

            {useBrandKit && (
              <div className="space-y-3">
                <input
                  value={brandKit.brandName}
                  onChange={(event) =>
                    updateBrandKit("brandName", event.target.value)
                  }
                  placeholder="نام برند، مثلاً راستینو"
                  className="r-input w-full rounded-2xl p-3 text-sm outline-none"
                />

                <input
                  value={brandKit.mainColor}
                  onChange={(event) =>
                    updateBrandKit("mainColor", event.target.value)
                  }
                  placeholder="رنگ اصلی برند، مثلاً مشکی و آبی"
                  className="r-input w-full rounded-2xl p-3 text-sm outline-none"
                />

                <input
                  value={brandKit.slogan}
                  onChange={(event) =>
                    updateBrandKit("slogan", event.target.value)
                  }
                  placeholder="شعار یا پیام برند"
                  className="r-input w-full rounded-2xl p-3 text-sm outline-none"
                />

                <div>
                  <p className="mb-2 text-xs font-black r-muted">
                    لحن بصری برند
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {brandTones.map((tone) => (
                      <button
                        key={tone}
                        onClick={() => updateBrandKit("brandTone", tone)}
                        className={`rounded-xl px-3 py-2 text-xs font-bold ${
                          brandKit.brandTone === tone
                            ? "r-pill-active"
                            : "r-pill"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="image-panel-section">
            <p className="mb-3 text-sm font-black">پرامپت اصلی</p>

            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="مثلاً: یک بنر حرفه‌ای برای معرفی یک ابزار هوش مصنوعی..."
              rows={7}
              className="r-input w-full resize-none rounded-2xl p-4 text-sm leading-7 outline-none placeholder:text-zinc-600"
            />

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={onImprovePrompt}
                className="rounded-2xl border border-[#2a2a2a] bg-[#151515] py-3 text-sm font-black text-zinc-100 transition hover:bg-[#1d1d1d]"
              >
                بهتر کردن
              </button>

              <button
                onClick={onArchitectPrompt}
                className="rounded-2xl border border-[#2a2a2a] bg-[#f5f5f5] py-3 text-sm font-black text-[#070707] transition hover:bg-white"
              >
                Prompt Architect
              </button>
            </div>
          </section>

          <section className="image-panel-section">
            <p className="mb-3 text-sm font-black">سبک تصویر</p>

            <div className="flex flex-wrap gap-2">
              {imageStyles.map((item) => (
                <button
                  key={item}
                  onClick={() => setStyle(item)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold ${
                    style === item ? "r-pill-active" : "r-pill"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="image-panel-section">
            <p className="mb-3 text-sm font-black">نسبت تصویر</p>

            <div className="grid grid-cols-5 gap-2">
              {aspectRatios.map((item) => (
                <button
                  key={item}
                  onClick={() => setAspectRatio(item)}
                  className={`image-ratio-button ${
                    aspectRatio === item ? "image-ratio-button-active" : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="image-panel-section">
            <p className="mb-3 text-sm font-black">کیفیت خروجی</p>

            <div className="grid gap-2">
              {imageQualities.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setQuality(item.id)}
                  className={`image-quality-row ${
                    quality === item.id ? "image-quality-row-active" : ""
                  }`}
                >
                  <span className="font-black">{item.label}</span>

                  <span
                    className={`text-xs ${
                      quality === item.id ? "text-black/60" : "r-muted"
                    }`}
                  >
                    {item.hint}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="image-panel-section">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black">تعداد خروجی</p>
              <span className="text-xs r-muted">{imageCount} تصویر</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  onClick={() => setImageCount(count)}
                  className={`rounded-xl px-3 py-2 text-xs font-black ${
                    imageCount === count ? "r-pill-active" : "r-pill"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </section>

          <section className="image-panel-section">
            <p className="mb-3 text-sm font-black">موارد ناخواسته</p>

            <textarea
              value={negativePrompt}
              onChange={(event) => setNegativePrompt(event.target.value)}
              placeholder="مثلاً: کیفیت پایین، متن خراب، دست اضافه، چهره نامشخص..."
              rows={3}
              className="r-input w-full resize-none rounded-2xl p-4 text-sm leading-7 outline-none placeholder:text-zinc-600"
            />
          </section>
        </div>
      </div>

      <div className="mt-4 border-t border-[#202020] pt-4">
        <button
          onClick={onGenerateImage}
          disabled={isLoading || !prompt.trim()}
          className="image-generate-button"
        >
          {isLoading ? "در حال ساخت تصویر..." : "ساخت تصویر حرفه‌ای"}
        </button>

        <p className="mt-3 text-center text-[11px] leading-6 r-muted">
          مدل‌های تصویر راستینو از AvalAI اجرا می‌شوند.
        </p>
      </div>
    </aside>
  );
}
