export type RastinoPlanTier = "free" | "plus" | "pro";
export type RastinoModelTier = RastinoPlanTier;

export type RastinoModelProvider =
  | "rastino"
  | "avalai"
  | "openai"
  | "google"
  | "gemini"
  | "deepseek"
  | "meta"
  | "cohere"
  | "xai"
  | "anthropic"
  | "qwen"
  | "mistral"
  | "gapgpt";

export const USD_TO_IRR = 170_000;

export type RastinoModel = {
  id: string;
  label: string;
  name: string;
  short: string;
  provider: RastinoModelProvider;
  logoKey: string;
  tier: RastinoPlanTier;
  role: string;
  feature: string;
  creditCost: number;
  inputUsdPerMillion: number;
  cachedInputUsdPerMillion?: number;
  outputUsdPerMillion: number;
  providerModel: string;
  apiProvider: "avalai" | "openrouter";
  contextWindow: number;
  outputLimit: number;
  supportsReasoning?: boolean;
  supportsVision?: boolean;
  supportsWebSearch?: boolean;
  isAuto?: boolean;
  hidden?: boolean;
};

export const rastinoModels = [
  {
    id: "rastino-auto",
    label: "Rastino Auto",
    name: "Rastino Auto",
    short: "Auto",
    provider: "rastino",
    logoKey: "gemini",
    tier: "free",
    role: "انتخاب هوشمند مدل مناسب برای سؤال شما",
    feature: "سریع، اقتصادی و مناسب استفاده روزمره",
    creditCost: 1,
    inputUsdPerMillion: 0.1,
    cachedInputUsdPerMillion: 0.05,
    outputUsdPerMillion: 0.4,
    providerModel: "gemini-2.5-flash-lite",
    apiProvider: "avalai",
    contextWindow: 8000,
    outputLimit: 1000,
    supportsReasoning: true,
    supportsVision: false,
    supportsWebSearch: false,
    isAuto: true,
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini Flash Lite",
    name: "Gemini Flash Lite",
    short: "Lite",
    provider: "google",
    logoKey: "gemini",
    tier: "free",
    role: "مدل سریع و اقتصادی گوگل",
    feature: "مناسب چت، تولید متن و تحلیل سبک",
    creditCost: 1,
    inputUsdPerMillion: 0.1,
    cachedInputUsdPerMillion: 0.05,
    outputUsdPerMillion: 0.4,
    providerModel: "gemini-2.5-flash-lite",
    apiProvider: "avalai",
    contextWindow: 8000,
    outputLimit: 1000,
    supportsReasoning: true,
    supportsVision: true,
    supportsWebSearch: false,
  },
  {
    id: "deepseek-v3.1",
    label: "DeepSeek V3.1",
    name: "DeepSeek V3.1",
    short: "V3.1",
    provider: "deepseek",
    logoKey: "deepseek",
    tier: "free",
    role: "مدل اقتصادی و شناخته‌شده",
    feature: "مناسب فارسی، کدنویسی سبک و استدلال روزمره",
    creditCost: 2,
    inputUsdPerMillion: 0.56,
    cachedInputUsdPerMillion: 0.07,
    outputUsdPerMillion: 1.68,
    providerModel: "deepseek-v3.1",
    apiProvider: "avalai",
    contextWindow: 8000,
    outputLimit: 1200,
    supportsReasoning: true,
    supportsVision: false,
    supportsWebSearch: false,
  },
  {
    id: "gpt-4o-mini-search-preview",
    label: "GPT-4o Mini",
    name: "GPT-4o Mini",
    short: "Mini",
    provider: "openai",
    logoKey: "openai",
    tier: "free",
    role: "مدل سبک OpenAI",
    feature: "پاسخ سریع و عمومی؛ وب در Free غیرفعال",
    creditCost: 1,
    inputUsdPerMillion: 0.15,
    cachedInputUsdPerMillion: 0.075,
    outputUsdPerMillion: 0.6,
    providerModel: "gpt-4o-mini-search-preview",
    apiProvider: "avalai",
    contextWindow: 8000,
    outputLimit: 1000,
    supportsReasoning: false,
    supportsVision: true,
    supportsWebSearch: false,
  },
  {
    id: "meta.llama3-3-70b-instruct-v1:0",
    label: "Llama 3.3 70B",
    name: "Llama 3.3 70B",
    short: "70B",
    provider: "meta",
    logoKey: "meta",
    tier: "free",
    role: "مدل بزرگ متن‌باز متا",
    feature: "مناسب چت عمومی، ایده‌پردازی و پاسخ متنی",
    creditCost: 2,
    inputUsdPerMillion: 0.72,
    outputUsdPerMillion: 0.72,
    providerModel: "meta.llama3-3-70b-instruct-v1:0",
    apiProvider: "avalai",
    contextWindow: 8000,
    outputLimit: 1000,
    supportsReasoning: false,
    supportsVision: false,
    supportsWebSearch: false,
  },

  {
    id: "gpt-5.4-mini",
    label: "GPT-5.4 Mini",
    name: "GPT-5.4 Mini",
    short: "5.4 Mini",
    provider: "openai",
    logoKey: "openai",
    tier: "plus",
    role: "مدل سریع و قدرتمند OpenAI",
    feature: "کیفیت بالا با هزینه کنترل‌شده",
    creditCost: 4,
    inputUsdPerMillion: 0.75,
    cachedInputUsdPerMillion: 0.075,
    outputUsdPerMillion: 3,
    providerModel: "gpt-5.4-mini",
    apiProvider: "avalai",
    contextWindow: 32000,
    outputLimit: 2000,
    supportsReasoning: true,
    supportsVision: true,
    supportsWebSearch: false,
  },
  {
    id: "gpt-5.3-codex",
    label: "GPT-5.3 Codex",
    name: "GPT-5.3 Codex",
    short: "Codex",
    provider: "openai",
    logoKey: "openai",
    tier: "plus",
    role: "مدل تخصصی کدنویسی",
    feature: "مناسب برنامه‌نویسی، refactor و debug",
    creditCost: 8,
    inputUsdPerMillion: 2,
    cachedInputUsdPerMillion: 0.2,
    outputUsdPerMillion: 10,
    providerModel: "gpt-5.3-codex",
    apiProvider: "avalai",
    contextWindow: 32000,
    outputLimit: 3000,
    supportsReasoning: true,
    supportsVision: false,
    supportsWebSearch: false,
  },
  {
    id: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    name: "Gemini 3.5 Flash",
    short: "3.5 Flash",
    provider: "google",
    logoKey: "gemini",
    tier: "plus",
    role: "مدل سریع و پیشرفته گوگل",
    feature: "مناسب تحلیل، کدنویسی و reasoning سبک",
    creditCost: 6,
    inputUsdPerMillion: 1.5,
    cachedInputUsdPerMillion: 0.25,
    outputUsdPerMillion: 9,
    providerModel: "gemini-3.5-flash",
    apiProvider: "avalai",
    contextWindow: 32000,
    outputLimit: 3000,
    supportsReasoning: true,
    supportsVision: true,
    supportsWebSearch: false,
  },
  {
    id: "claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    name: "Claude Haiku 4.5",
    short: "Haiku",
    provider: "anthropic",
    logoKey: "anthropic",
    tier: "plus",
    role: "مدل سریع Anthropic",
    feature: "مناسب نوشتار، تحلیل سبک و سرعت بالا",
    creditCost: 5,
    inputUsdPerMillion: 1,
    cachedInputUsdPerMillion: 0.1,
    outputUsdPerMillion: 5,
    providerModel: "claude-haiku-4.5",
    apiProvider: "avalai",
    contextWindow: 32000,
    outputLimit: 2500,
    supportsReasoning: true,
    supportsVision: true,
    supportsWebSearch: false,
  },
  {
    id: "deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    name: "DeepSeek V4 Pro",
    short: "V4 Pro",
    provider: "deepseek",
    logoKey: "deepseek",
    tier: "plus",
    role: "مدل reasoning اقتصادی و قوی",
    feature: "مناسب استدلال، فارسی و کدنویسی",
    creditCost: 5,
    inputUsdPerMillion: 1.74,
    cachedInputUsdPerMillion: 0.2,
    outputUsdPerMillion: 3.48,
    providerModel: "deepseek-v4-pro",
    apiProvider: "avalai",
    contextWindow: 32000,
    outputLimit: 3000,
    supportsReasoning: true,
    supportsVision: false,
    supportsWebSearch: false,
  },

  {
    id: "gpt-5.5",
    label: "GPT-5.5",
    name: "GPT-5.5",
    short: "5.5",
    provider: "openai",
    logoKey: "openai",
    tier: "pro",
    role: "مدل پرچمدار OpenAI",
    feature: "مناسب تحلیل عمیق و کدنویسی جدی",
    creditCost: 20,
    inputUsdPerMillion: 5,
    cachedInputUsdPerMillion: 0.5,
    outputUsdPerMillion: 30,
    providerModel: "gpt-5.5",
    apiProvider: "avalai",
    contextWindow: 64000,
    outputLimit: 5000,
    supportsReasoning: true,
    supportsVision: true,
    supportsWebSearch: false,
  },
  {
    id: "claude-opus-4.8",
    label: "Claude Opus 4.8",
    name: "Claude Opus 4.8",
    short: "Opus 4.8",
    provider: "anthropic",
    logoKey: "anthropic",
    tier: "pro",
    role: "مدل لوکس Anthropic",
    feature: "مناسب تحلیل عمیق، نوشتار حرفه‌ای و معماری کد",
    creditCost: 28,
    inputUsdPerMillion: 15,
    cachedInputUsdPerMillion: 1.5,
    outputUsdPerMillion: 75,
    providerModel: "claude-opus-4.8",
    apiProvider: "avalai",
    contextWindow: 64000,
    outputLimit: 5000,
    supportsReasoning: true,
    supportsVision: true,
    supportsWebSearch: false,
  },
  {
    id: "claude-opus-4.6",
    label: "Claude Opus 4.6",
    name: "Claude Opus 4.6",
    short: "Opus 4.6",
    provider: "anthropic",
    logoKey: "anthropic",
    tier: "pro",
    role: "مدل قدرتمند Anthropic",
    feature: "مناسب خروجی‌های دقیق، طولانی و حرفه‌ای",
    creditCost: 24,
    inputUsdPerMillion: 12,
    cachedInputUsdPerMillion: 1.2,
    outputUsdPerMillion: 60,
    providerModel: "claude-opus-4.6",
    apiProvider: "avalai",
    contextWindow: 64000,
    outputLimit: 5000,
    supportsReasoning: true,
    supportsVision: true,
    supportsWebSearch: false,
  },
  {
    id: "gemini-3.1-pro-preview",
    label: "Gemini 3.1 Pro",
    name: "Gemini 3.1 Pro Preview",
    short: "3.1 Pro",
    provider: "google",
    logoKey: "gemini",
    tier: "pro",
    role: "مدل Pro گوگل",
    feature: "مناسب تحلیل فایل، برنامه‌نویسی و مسئله‌های پیچیده",
    creditCost: 16,
    inputUsdPerMillion: 2,
    cachedInputUsdPerMillion: 0.825,
    outputUsdPerMillion: 12,
    providerModel: "gemini-3.1-pro-preview",
    apiProvider: "avalai",
    contextWindow: 64000,
    outputLimit: 5000,
    supportsReasoning: true,
    supportsVision: true,
    supportsWebSearch: false,
  },
  {
    id: "grok-4.3",
    label: "Grok 4.3",
    name: "Grok 4.3",
    short: "4.3",
    provider: "xai",
    logoKey: "xai",
    tier: "pro",
    role: "مدل پرچمدار xAI",
    feature: "مناسب reasoning، مکالمه پیشرفته و تحلیل طولانی",
    creditCost: 16,
    inputUsdPerMillion: 3,
    cachedInputUsdPerMillion: 0.3,
    outputUsdPerMillion: 15,
    providerModel: "grok-4.3",
    apiProvider: "avalai",
    contextWindow: 64000,
    outputLimit: 5000,
    supportsReasoning: true,
    supportsVision: false,
    supportsWebSearch: false,
  },

  {
    id: "rastino-router-light",
    label: "Rastino Router Light",
    name: "Rastino Router Light",
    short: "Router",
    provider: "cohere",
    logoKey: "cohere",
    tier: "free",
    role: "مدل داخلی راستینو",
    feature: "مسیریابی، عنوان‌سازی و طبقه‌بندی سبک",
    creditCost: 1,
    inputUsdPerMillion: 0.3,
    cachedInputUsdPerMillion: 0.15,
    outputUsdPerMillion: 0.6,
    providerModel: "cohere.command-light-text-v14",
    apiProvider: "avalai",
    contextWindow: 4096,
    outputLimit: 512,
    supportsReasoning: false,
    supportsVision: false,
    supportsWebSearch: false,
    hidden: true,
  },
] satisfies RastinoModel[];

export type RastinoModelId = (typeof rastinoModels)[number]["id"];

export function normalizePlan(plan?: string | null): RastinoPlanTier {
  if (plan === "pro") return "pro";
  if (plan === "plus") return "plus";
  return "free";
}

function allowedTiersForPlan(plan?: string | null): RastinoPlanTier[] {
  const normalizedPlan = normalizePlan(plan);

  if (normalizedPlan === "pro") return ["free", "plus", "pro"];
  if (normalizedPlan === "plus") return ["free", "plus"];
  return ["free"];
}

export function getRastinoModel(modelId?: string | null) {
  if (!modelId) return undefined;

  return rastinoModels.find(
    (model) =>
      model.id === modelId ||
      model.providerModel === modelId ||
      (model.isAuto && modelId === "auto")
  );
}

export function getModelsForPlan(plan?: string | null) {
  const allowedTiers = allowedTiersForPlan(plan);

  return rastinoModels.filter(
    (model) => !model.hidden && allowedTiers.includes(model.tier)
  );
}

export function getRastinoModelsForPlan(plan?: string | null) {
  return getModelsForPlan(plan);
}

export function getTextModelsForPlan(plan?: string | null) {
  return getModelsForPlan(plan);
}

export function canUseModel(plan: string | null | undefined, modelId: string) {
  const model = getRastinoModel(modelId);
  if (!model) return false;

  return allowedTiersForPlan(plan).includes(model.tier);
}

export function canUseRastinoModel(
  plan: string | null | undefined,
  modelId: string
) {
  return canUseModel(plan, modelId);
}

export function getDefaultModelForPlan(plan?: string | null): RastinoModelId {
  const models = getModelsForPlan(plan);
  return (models[0]?.id || "rastino-auto") as RastinoModelId;
}

export function getModelCreditCost(modelId?: string | null) {
  return getRastinoModel(modelId)?.creditCost || 1;
}

export function getProviderModel(modelId?: string | null) {
  return getRastinoModel(modelId)?.providerModel || "gemini-2.5-flash-lite";
}

export function getModelContextLimit(modelId?: string | null) {
  return getRastinoModel(modelId)?.contextWindow || 8000;
}

export function getModelOutputLimit(modelId?: string | null) {
  return getRastinoModel(modelId)?.outputLimit || 1000;
}

export function calculateEstimatedModelCost({
  modelId,
  inputTokens = 1000,
  outputTokens = 700,
}: {
  modelId?: string | null;
  inputTokens?: number;
  outputTokens?: number;
}) {
  const model = getRastinoModel(modelId) || getRastinoModel("rastino-auto")!;

  const inputCostUsd = (inputTokens / 1_000_000) * model.inputUsdPerMillion;
  const outputCostUsd = (outputTokens / 1_000_000) * model.outputUsdPerMillion;

  return {
    modelId: model.id,
    provider: model.provider,
    providerModel: model.providerModel,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    inputCostUsd,
    outputCostUsd,
    totalCostUsd: inputCostUsd + outputCostUsd,
    creditCost: model.creditCost,
  };
}

export function estimateMessageCostIrr({
  modelId,
  inputTokens = 1000,
  outputTokens = 700,
  exchangeRate = USD_TO_IRR,
}: {
  modelId?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  exchangeRate?: number;
} = {}) {
  const estimate = calculateEstimatedModelCost({
    modelId,
    inputTokens,
    outputTokens,
  });

  return Math.ceil(estimate.totalCostUsd * exchangeRate);
}
