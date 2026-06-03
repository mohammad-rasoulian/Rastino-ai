"use client";

import { useMemo, useState } from "react";
import type { GeneratedImage, ImageMagicAction } from "./types";
import { imageModels } from "./image-data";

type ImageGalleryProps = {
  images: GeneratedImage[];
  onReusePrompt: (prompt: string) => void;
  onMagicAction: (image: GeneratedImage, action: ImageMagicAction) => void;
};

const magicActions: { id: ImageMagicAction; label: string }[] = [
  { id: "similar", label: "مشابه بساز" },
  { id: "website-banner", label: "بنر سایت" },
  { id: "story", label: "استوری" },
  { id: "social-post", label: "پست شبکه اجتماعی" },
  { id: "improve", label: "بهبود پرامپت" },
];

function getModelName(modelId: string) {
  return imageModels.find((model) => model.id === modelId)?.name || modelId;
}

function getImageFileName(url?: string) {
  if (!url) return "";

  try {
    const cleanUrl = url.split("?")[0];
    const parts = cleanUrl.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    return "";
  }
}

function getDisplayImageUrl(url?: string) {
  if (!url) return "";

  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  if (url.startsWith("/generated/images/")) {
    const filename = getImageFileName(url);

    if (filename) {
      return `/api/generated-images/${encodeURIComponent(filename)}?v=${Date.now()}`;
    }
  }

  return `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
}

function ImagePreview({
  image,
  onLoadError,
}: {
  image: GeneratedImage;
  onLoadError: (id: string) => void;
}) {
  const displayUrl = useMemo(() => getDisplayImageUrl(image.url), [image.url]);

  if (!displayUrl) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10 text-2xl">
          ?
        </div>
        <p className="text-sm font-bold text-yellow-100">آدرس تصویر خالی است.</p>
      </div>
    );
  }

  return (
    <img
      src={displayUrl}
      alt={image.prompt}
      className="aspect-square w-full bg-[#050505] object-cover"
      loading="eager"
      decoding="async"
      onLoad={() => {
        console.log("[IMAGE LOAD OK]", {
          id: image.id,
          originalUrl: image.url,
          displayUrl,
        });
      }}
      onError={() => {
        console.error("[IMAGE LOAD ERROR]", {
          id: image.id,
          originalUrl: image.url,
          displayUrl,
        });

        onLoadError(image.id);
      }}
    />
  );
}

export function ImageGallery({
  images,
  onReusePrompt,
  onMagicAction,
}: ImageGalleryProps) {
  const [failedImageIds, setFailedImageIds] = useState<string[]>([]);

  function markImageFailed(id: string) {
    setFailedImageIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {images.map((image) => {
        const isLoading = image.status === "loading";
        const isError = image.status === "error";
        const hasFailedToLoad = failedImageIds.includes(image.id);
        const displayUrl = getDisplayImageUrl(image.url);

        return (
          <article
            key={image.id}
            className="overflow-hidden rounded-[1.7rem] border border-[#202020] bg-[#0d0d0d]"
          >
            <div className="relative bg-[#050505]">
              {isLoading && (
                <div className="flex aspect-square w-full flex-col items-center justify-center p-6 text-center">
                  <div className="mb-5 h-16 w-16 animate-spin rounded-full border-2 border-white/20 border-t-white" />

                  <p className="text-lg font-black">در حال ساخت تصویر...</p>
                  <p className="mt-2 max-w-xs text-sm leading-7 r-muted">
                    راستینو در حال ساخت خروجی نهایی است.
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-2 text-[11px]">
                    <span className="rounded-full bg-white/5 px-3 py-1">
                      {getModelName(image.model)}
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1">
                      {image.aspectRatio}
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1">
                      {image.quality}
                    </span>
                  </div>
                </div>
              )}

              {isError && (
                <div className="flex aspect-square w-full flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
                    !
                  </div>

                  <p className="text-lg font-black text-red-200">
                    تولید تصویر ناموفق بود
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-7 r-muted">
                    {image.errorMessage ||
                      "مدل تصویر فعلاً پاسخ نداد. چند لحظه بعد دوباره تلاش کن."}
                  </p>
                </div>
              )}

              {!isLoading && !isError && image.url && !hasFailedToLoad && (
                <ImagePreview image={image} onLoadError={markImageFailed} />
              )}

              {!isLoading && !isError && hasFailedToLoad && (
                <div className="flex aspect-square w-full flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10 text-2xl">
                    ⚠️
                  </div>

                  <p className="text-lg font-black text-yellow-100">
                    تصویر ساخته شد، اما در کارت لود نشد
                  </p>
                  <p className="mt-2 max-w-xs break-all text-xs leading-6 r-muted">
                    {image.url}
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {displayUrl && (
                      <a
                        href={displayUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="r-secondary rounded-xl px-3 py-2 text-xs font-bold"
                      >
                        باز کردن از route امن
                      </a>
                    )}

                    {image.url && (
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noreferrer"
                        className="r-pill rounded-xl px-3 py-2 text-xs font-bold"
                      >
                        باز کردن لینک اصلی
                      </a>
                    )}
                  </div>
                </div>
              )}

              {!isLoading && !isError && (
                <div className="absolute right-3 top-3 flex gap-2">
                  <span className="rounded-full bg-black/70 px-3 py-1 text-[11px] text-white backdrop-blur">
                    {getModelName(image.model)}
                  </span>

                  <span className="rounded-full bg-black/70 px-3 py-1 text-[11px] text-white backdrop-blur">
                    {image.aspectRatio}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs r-muted">
                <span>{image.style}</span>
                <span>{image.createdAt}</span>
              </div>

              <p className="line-clamp-2 text-sm leading-7">{image.prompt}</p>

              {!isLoading && !isError && image.url && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => onReusePrompt(image.prompt)}
                    className="r-secondary rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    استفاده دوباره
                  </button>

                  {magicActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => onMagicAction(image, action.id)}
                      className="r-pill rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      {action.label}
                    </button>
                  ))}

                  <a
                    href={getDisplayImageUrl(image.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="r-pill rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    باز کردن
                  </a>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
