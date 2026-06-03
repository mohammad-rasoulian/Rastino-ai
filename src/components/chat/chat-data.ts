import { rastinoModels } from "@/lib/ai/model-catalog";
import type { ModelInfo, ToneModeInfo } from "./types";

const modelNames: Record<string, string> = {
  "gemini-2.5-flash-lite": "Gemini Flash Lite",
  "gpt-5-nano": "GPT Nano",
  "gpt-4.1-nano": "GPT 4.1 Nano",
  "deepseek-v4-flash": "DeepSeek Flash",
  "qwen3-235b-a22b": "Qwen 235B",

  "gpt-4o-mini": "GPT 4o Mini",
  "gpt-5-mini": "GPT 5 Mini",
  "gemini-3.1-flash-lite-preview": "Gemini 3.1 Lite",
  "gapgpt-qwen-3.6": "GapGPT Qwen 3.6",
  "qwen3-coder": "Qwen Coder",

  "gpt-5.3-chat-latest": "GPT 5.3",
  "claude-sonnet-4-6": "Claude Sonnet 4.6",
  "gemini-3.1-pro-preview": "Gemini 3.1 Pro",
  o3: "OpenAI o3",
  "grok-4.3": "Grok 4.3",
};

const modelShorts: Record<string, string> = {
  "gemini-2.5-flash-lite": "سریع و سبک",
  "gpt-5-nano": "ارزان و فوری",
  "gpt-4.1-nano": "سبک و پایدار",
  "deepseek-v4-flash": "اقتصادی و سریع",
  "qwen3-235b-a22b": "به‌صرفه و کاربردی",

  "gpt-4o-mini": "روزمره و مطمئن",
  "gpt-5-mini": "متعادل و هوشمند",
  "gemini-3.1-flash-lite-preview": "سریع و دقیق",
  "gapgpt-qwen-3.6": "اقتصادی و روان",
  "qwen3-coder": "مخصوص کدنویسی",

  "gpt-5.3-chat-latest": "قدرتمند و دقیق",
  "claude-sonnet-4-6": "نوشتاری و تحلیلی",
  "gemini-3.1-pro-preview": "تحلیلی و پیشرفته",
  o3: "استدلال عمیق",
  "grok-4.3": "خلاق و آزاد",
};

function tierLabel(tier: string) {
  if (tier === "pro") return "پرو";
  if (tier === "plus") return "پلاس";
  return "رایگان";
}

export const models: ModelInfo[] = rastinoModels.map((model) => ({
  id: model.id,
  name: modelNames[model.id] || model.label,
  short: modelShorts[model.id] || model.short,
  feature: `${tierLabel(model.tier)} • ${model.role} • ${model.creditCost} اعتبار`,
  provider: model.provider,
  tier: model.tier,
  creditCost: model.creditCost,
}));

export const toneModes: ToneModeInfo[] = [
  {
    id: "adaptive-human",
    label: "خودکار",
    short: "Auto",
    description: "راستینو خودش بر اساس پیام کاربر لحن مناسب را انتخاب می‌کند.",
  },
  {
    id: "formal",
    label: "رسمی",
    short: "Formal",
    description: "مؤدب، دقیق و مناسب کارهای جدی یا حرفه‌ای.",
  },
  {
    id: "friendly",
    label: "صمیمی",
    short: "Friendly",
    description: "گرم، طبیعی و شبیه گفت‌وگوی انسانی روزمره.",
  },
  {
    id: "playful",
    label: "شوخ",
    short: "Fun",
    description: "شوخی سبک و محترمانه وقتی موضوع اجازه بدهد.",
  },
  {
    id: "direct",
    label: "مستقیم",
    short: "Fast",
    description: "کوتاه، سریع و بدون حاشیه.",
  },
  {
    id: "teacher",
    label: "آموزشی",
    short: "Teach",
    description: "مرحله‌به‌مرحله، ساده و قابل فهم.",
  },
  {
    id: "expert",
    label: "حرفه‌ای",
    short: "Pro",
    description: "تحلیلی، تخصصی و مناسب تصمیم‌های جدی.",
  },
];

export const presets = [
  "خیلی ساده و قابل فهم برای همه توضیح بده.",
  "جواب را کوتاه، دقیق و کاری بنویس.",
  "مرحله‌به‌مرحله توضیح بده و نکات مهم را جدا کن.",
  "اول مفهوم را بگو، بعد مثال بزن، بعد جمع‌بندی کن.",
];

export const suggestions = [
  "این مسئله رو مرحله‌به‌مرحله حل کن",
  "این متن رو خلاصه کن",
  "از این متن چند سؤال کاربردی بساز",
  "برای کار یک مرور سریع بده",
];
