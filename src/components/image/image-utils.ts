import { defaultImageModel } from "./image-data";
import {
  ASPECT_RATIO_IDS,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_IMAGE_QUALITY,
  DEFAULT_IMAGE_STYLE,
  IMAGE_MODEL_IDS,
  IMAGE_PAYLOAD_PREFIX,
  IMAGE_QUALITY_IDS,
} from "./image-constants";
import type {
  AspectRatio,
  GeneratedImage,
  ImageBrandKit,
  ImageModelId,
  ImageQuality,
  SavedImagePayload,
} from "./types";

export function isImageModelId(value: string): value is ImageModelId {
  return IMAGE_MODEL_IDS.includes(value as ImageModelId);
}

export function isAspectRatio(value: string): value is AspectRatio {
  return ASPECT_RATIO_IDS.includes(value as AspectRatio);
}

export function isImageQuality(value: string): value is ImageQuality {
  return IMAGE_QUALITY_IDS.includes(value as ImageQuality);
}

export function parseImagePayload(content: string): SavedImagePayload | null {
  if (!content.startsWith(IMAGE_PAYLOAD_PREFIX)) return null;

  try {
    return JSON.parse(content.replace(IMAGE_PAYLOAD_PREFIX, ""));
  } catch {
    return null;
  }
}

export function buildFinalImagePrompt({
  prompt,
  style,
  quality,
  aspectRatio,
  brandKit,
  presetHint,
}: {
  prompt: string;
  style: string;
  quality: ImageQuality;
  aspectRatio: AspectRatio;
  brandKit?: ImageBrandKit;
  presetHint?: string;
}) {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) return "";

  const cleanPresetHint = presetHint?.trim();

  const brandName = brandKit?.brandName?.trim();
  const brandTone = brandKit?.brandTone?.trim();
  const mainColor = brandKit?.mainColor?.trim();
  const slogan = brandKit?.slogan?.trim();

  const presetSection = cleanPresetHint
    ? `
هدف خروجی:
${cleanPresetHint}`
    : "";

  const brandSection =
    brandName || brandTone || mainColor || slogan
      ? `
اطلاعات برند:
نام برند: ${brandName || "نامشخص"}
لحن بصری برند: ${brandTone || "مدرن و حرفه‌ای"}
رنگ اصلی برند: ${mainColor || "هماهنگ با تصویر"}
شعار یا پیام برند: ${slogan || "ندارد"}`
      : "";

  return `${cleanPrompt}

${presetSection}

${brandSection}

تنظیمات خروجی:
سبک تصویر: ${style}
کیفیت: ${quality}
نسبت تصویر: ${aspectRatio}

دستور تولید:
تصویر باید حرفه‌ای، تمیز، چشم‌نواز و قابل استفاده برای محصول واقعی باشد. ترکیب‌بندی دقیق، نورپردازی کنترل‌شده، جزئیات مناسب، کنتراست خوب و خروجی آماده استفاده در وب‌سایت یا شبکه‌های اجتماعی داشته باشد. اگر متن داخل تصویر لازم است، باید خوانا، درست و کم‌حجم باشد. از شلوغی، کیفیت پایین، دست‌های خراب، نوشته‌های اشتباه و ترکیب‌بندی نامرتب پرهیز شود.`;
}

export function buildImprovedPrompt(prompt: string) {
  const base = prompt.trim() || "یک تصویر حرفه‌ای برای برند راستینو";

  return `${base}

این تصویر را به شکل یک خروجی حرفه‌ای و آماده استفاده طراحی کن. هدف تصویر باید در نگاه اول واضح باشد. ترکیب‌بندی تمیز، سوژه مشخص، نورپردازی حرفه‌ای، جزئیات دقیق، رنگ‌بندی هماهنگ و حس بصری مدرن داشته باشد. تصویر برای استفاده واقعی در وب‌سایت، شبکه‌های اجتماعی یا کمپین تبلیغاتی مناسب باشد.`;
}

export function normalizeSavedImages(
  payload: SavedImagePayload,
  chatId: string
): GeneratedImage[] {
  return (payload.images || [])
    .map((image, index) => {
      const imageModel = isImageModelId(image.model)
        ? image.model
        : defaultImageModel;

      const imageAspectRatio = isAspectRatio(image.aspectRatio)
        ? image.aspectRatio
        : DEFAULT_ASPECT_RATIO;

      const imageQuality = isImageQuality(image.quality)
        ? image.quality
        : DEFAULT_IMAGE_QUALITY;

      return {
        id: image.id || `${chatId}-${index}`,
        prompt: image.prompt || payload.prompt || "",
        model: imageModel,
        style: image.style || payload.style || DEFAULT_IMAGE_STYLE,
        aspectRatio: imageAspectRatio,
        quality: imageQuality,
        url: image.url,
        createdAt: image.createdAt || "",
      };
    })
    .filter((image) => Boolean(image.url));
}

export function normalizeSavedPayloadSettings(payload: SavedImagePayload) {
  return {
    prompt: payload.prompt || "",
    style: payload.style || DEFAULT_IMAGE_STYLE,
    model: isImageModelId(payload.model) ? payload.model : defaultImageModel,
    aspectRatio: isAspectRatio(payload.aspectRatio)
      ? payload.aspectRatio
      : DEFAULT_ASPECT_RATIO,
    quality: isImageQuality(payload.quality)
      ? payload.quality
      : DEFAULT_IMAGE_QUALITY,
    brandKit: payload.brandKit,
    presetId: payload.presetId || null,
  };
}

export function createGeneratedImage({
  prompt,
  model,
  style,
  aspectRatio,
  quality,
  url,
}: {
  prompt: string;
  model: ImageModelId;
  style: string;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  url: string;
}): GeneratedImage {
  return {
    id: crypto.randomUUID(),
    prompt,
    model,
    style,
    aspectRatio,
    quality,
    url,
    createdAt: new Date().toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
