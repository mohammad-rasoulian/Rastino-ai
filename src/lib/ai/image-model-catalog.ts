export type RastinoImagePlanTier = "free" | "plus" | "pro";
export type RastinoImageProvider = "avalai";
export type RastinoImageEndpoint = "images" | "chat";

export type RastinoImageModel = {
  id: string;
  label: string;
  titleFa: string;
  descriptionFa: string;
  provider: RastinoImageProvider;
  avalaiProvider: "alibaba" | "google" | "openai";
  endpoint: RastinoImageEndpoint;
  tier: RastinoImagePlanTier;
  creditCost: number;
  priceHint: string;
  recommended: boolean;
};

export const rastinoImageModels: RastinoImageModel[] = [
  {
    id: "z-image-turbo",
    label: "Rastino Fast",
    titleFa: "تصویر سریع پایه",
    descriptionFa: "رایگان، سریع و مناسب تست ایده",
    provider: "avalai",
    avalaiProvider: "alibaba",
    endpoint: "images",
    tier: "free",
    creditCost: 1,
    priceHint: "0.015 credit/image",
    recommended: true,
  },
  {
    id: "imagen-4.0-ultra-generate-001",
    label: "Imagen Ultra",
    titleFa: "تصویر Ultra",
    descriptionFa: "کیفیت بالا برای خروجی حرفه‌ای",
    provider: "avalai",
    avalaiProvider: "google",
    endpoint: "images",
    tier: "plus",
    creditCost: 4,
    priceHint: "0.06 credit/image",
    recommended: true,
  },
  {
    id: "gemini-2.5-flash-image",
    label: "Gemini Flash Image",
    titleFa: "تصویر هوشمند چندوجهی",
    descriptionFa: "پلاس، سریع و مناسب سناریوهای تصویری پیچیده‌تر",
    provider: "avalai",
    avalaiProvider: "google",
    endpoint: "chat",
    tier: "plus",
    creditCost: 3,
    priceHint: "0.04 credit/image",
    recommended: true,
  },
  {
    id: "gemini-3.1-flash-image",
    label: "Gemini Advanced Image",
    titleFa: "تصویر پیشرفته Gemini",
    descriptionFa: "پرو، کیفیت و فهم بهتر برای پرامپت‌های جدی",
    provider: "avalai",
    avalaiProvider: "google",
    endpoint: "chat",
    tier: "pro",
    creditCost: 6,
    priceHint: "0.0672 credit/image",
    recommended: true,
  },
  {
    id: "gpt-5.2",
    label: "GPT Studio",
    titleFa: "تصویر حرفه‌ای GPT",
    descriptionFa: "پرو، بالاترین دستورپذیری و خروجی خاص",
    provider: "avalai",
    avalaiProvider: "openai",
    endpoint: "chat",
    tier: "pro",
    creditCost: 8,
    priceHint: "token based",
    recommended: false,
  },
];

export function getRastinoImageModel(modelId?: string | null) {
  return rastinoImageModels.find((model) => model.id === modelId) || null;
}

function normalizePlan(plan?: string | null): RastinoImagePlanTier {
  if (plan === "pro") return "pro";
  if (plan === "plus") return "plus";
  return "free";
}

function allowedTiers(plan?: string | null): RastinoImagePlanTier[] {
  const normalized = normalizePlan(plan);

  if (normalized === "pro") return ["free", "plus", "pro"];
  if (normalized === "plus") return ["free", "plus"];
  return ["free"];
}

export function getImageModelsForPlan(plan?: string | null) {
  const tiers = allowedTiers(plan);
  return rastinoImageModels.filter((model) => tiers.includes(model.tier));
}

export function canUseImageModel(plan: string | null | undefined, modelId: string) {
  const model = getRastinoImageModel(modelId);
  if (!model) return false;

  return allowedTiers(plan).includes(model.tier);
}

export function canAdminUseImageModel(modelId: string) {
  return Boolean(getRastinoImageModel(modelId));
}

export function getDefaultImageModelForPlan(plan?: string | null) {
  const normalized = normalizePlan(plan);

  if (normalized === "pro") return "gemini-3.1-flash-image";
  if (normalized === "plus") return "imagen-4.0-ultra-generate-001";
  return "z-image-turbo";
}

export function getImageModelCreditCost(modelId: string) {
  return getRastinoImageModel(modelId)?.creditCost || 1;
}
