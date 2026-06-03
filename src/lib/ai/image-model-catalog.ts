export type RastinoImagePlanTier = "free" | "plus" | "pro" | "ultra";

export type RastinoImageProvider = "gapgpt" | "openai" | "google";

export const rastinoImageModels = [
  {
    id: "gapgpt/z-image",
    label: "Z Image",
    titleFa: "تصویر اقتصادی",
    descriptionFa: "ساده و ارزان",
    provider: "gapgpt",
    tier: "free",
    creditCost: 2,
    priceHint: "$0.0050",
    recommended: true,
  },

  {
    id: "imagen-4.0-fast-generate-001",
    label: "Imagen 4 Fast",
    titleFa: "تصویر سریع",
    descriptionFa: "سریع و تمیز",
    provider: "google",
    tier: "plus",
    creditCost: 6,
    priceHint: "$0.020",
    recommended: true,
  },
  {
    id: "gemini-2.5-flash-image",
    label: "Gemini 2.5 Flash Image",
    titleFa: "تصویر هوشمند",
    descriptionFa: "متعادل و کاربردی",
    provider: "google",
    tier: "plus",
    creditCost: 20,
    priceHint: "$0.040",
    recommended: false,
  },
  {
    id: "dall-e-3",
    label: "DALL·E 3",
    titleFa: "تصویر کلاسیک",
    descriptionFa: "خلاق و شناخته‌شده",
    provider: "openai",
    tier: "plus",
    creditCost: 12,
    priceHint: "$0.040",
    recommended: false,
  },

  {
    id: "imagen-4.0-ultra-generate-001",
    label: "Imagen 4 Ultra",
    titleFa: "تصویر دقیق",
    descriptionFa: "کیفیت بالاتر",
    provider: "google",
    tier: "pro",
    creditCost: 16,
    priceHint: "$0.060",
    recommended: false,
  },
  {
    id: "gemini-3.1-flash-image-preview",
    label: "Gemini 3.1 Flash Image",
    titleFa: "تصویر حرفه‌ای",
    descriptionFa: "سریع و پیشرفته",
    provider: "google",
    tier: "pro",
    creditCost: 20,
    priceHint: "$0.080",
    recommended: true,
  },
  {
    id: "gpt-image-1-mini",
    label: "GPT Image 1 Mini",
    titleFa: "تصویر جی‌پی‌تی",
    descriptionFa: "خوب و کنترل‌شده",
    provider: "openai",
    tier: "pro",
    creditCost: 60,
    priceHint: "$2 / $4",
    recommended: false,
  },
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    titleFa: "بهترین تصویر",
    descriptionFa: "کیفیت بسیار بالا",
    provider: "openai",
    tier: "pro",
    creditCost: 180,
    priceHint: "$8 / $30",
    recommended: false,
  },

  {
    id: "gemini-3-pro-image-preview",
    label: "Gemini 3 Pro Image",
    titleFa: "تصویر ویژه",
    descriptionFa: "گران و خاص",
    provider: "google",
    tier: "ultra",
    creditCost: 120,
    priceHint: "$2 / $120",
    recommended: false,
  },
] as const;

export type RastinoImageModelId = (typeof rastinoImageModels)[number]["id"];

export function getRastinoImageModel(modelId?: string | null) {
  return rastinoImageModels.find((model) => model.id === modelId) || null;
}

export function getImageModelsForPlan(plan?: string | null) {
  const normalizedPlan =
    plan === "pro" ? "pro" : plan === "plus" ? "plus" : "free";

  const allowedTiers =
    normalizedPlan === "pro"
      ? ["free", "plus", "pro"]
      : normalizedPlan === "plus"
        ? ["free", "plus"]
        : ["free"];

  return rastinoImageModels.filter((model) => allowedTiers.includes(model.tier));
}

export function getDefaultImageModelForPlan(plan?: string | null): RastinoImageModelId {
  if (plan === "pro") return "gemini-3.1-flash-image-preview";
  if (plan === "plus") return "imagen-4.0-fast-generate-001";

  return "gapgpt/z-image";
}

export function canUseImageModel(plan: string | null | undefined, modelId: string) {
  const model = getRastinoImageModel(modelId);
  if (!model) return false;

  const normalizedPlan =
    plan === "pro" ? "pro" : plan === "plus" ? "plus" : "free";

  if (normalizedPlan === "pro") {
    return model.tier === "free" || model.tier === "plus" || model.tier === "pro";
  }

  if (normalizedPlan === "plus") {
    return model.tier === "free" || model.tier === "plus";
  }

  return model.tier === "free";
}

export function canAdminUseImageModel(modelId: string) {
  return Boolean(getRastinoImageModel(modelId));
}
