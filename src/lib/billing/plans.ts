export type PlanId = "free" | "plus" | "pro";

export type PlanConfig = {
  id: PlanId;
  slug: PlanId;
  name: string;
  title: string;
  label: string;
  nameFa: string;
  nameEn: string;
  description: string;

  priceIrr: number;
  monthlyPriceIrr: number;
  priceToman: number;
  monthlyPriceToman: number;

  dailyMessages: number;
  dailyMessageLimit: number;
  monthlyMessages: number;

  monthlyCredits: number;
  maxMonthlyCredits: number;

  monthlyImages: number;
  maxImagesPerMonth: number;
  imageCredits: number;

  maxContextTokens: number;
  maxOutputTokens: number;

  canUseImages: boolean;
  canUploadFiles: boolean;
  canUseAdvancedModels: boolean;
  canUseProModels: boolean;
  canUseWebSearch: boolean;

  features: string[];
  badge?: string;
  isPopular?: boolean;
};

export const planConfigs: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    slug: "free",
    name: "رایگان",
    title: "پلن رایگان",
    label: "رایگان",
    nameFa: "رایگان",
    nameEn: "Free",
    description: "برای تست راستینو و استفاده سبک روزانه.",

    priceIrr: 0,
    monthlyPriceIrr: 0,
    priceToman: 0,
    monthlyPriceToman: 0,

    dailyMessages: 20,
    dailyMessageLimit: 20,
    monthlyMessages: 600,

    monthlyCredits: 600,
    maxMonthlyCredits: 600,

    monthlyImages: 0,
    maxImagesPerMonth: 0,
    imageCredits: 0,

    maxContextTokens: 8_000,
    maxOutputTokens: 1_000,

    canUseImages: false,
    canUploadFiles: false,
    canUseAdvancedModels: false,
    canUseProModels: false,
    canUseWebSearch: false,

    features: [
      "۲۰ پیام رایگان در روز",
      "دسترسی به مدل‌های اقتصادی و سریع",
      "مناسب تست و استفاده سبک",
      "بدون تولید تصویر",
    ],
  },

  plus: {
    id: "plus",
    slug: "plus",
    name: "پلاس",
    title: "پلن پلاس",
    label: "پلاس",
    nameFa: "پلاس",
    nameEn: "Plus",
    description: "برای کاربران جدی، تولید محتوا، یادگیری، کدنویسی سبک و استفاده روزانه.",

    priceIrr: 2_490_000,
    monthlyPriceIrr: 2_490_000,
    priceToman: 249_000,
    monthlyPriceToman: 249_000,

    dailyMessages: 120,
    dailyMessageLimit: 120,
    monthlyMessages: 3_600,

    monthlyCredits: 9_000,
    maxMonthlyCredits: 9_000,

    monthlyImages: 30,
    maxImagesPerMonth: 30,
    imageCredits: 30,

    maxContextTokens: 32_000,
    maxOutputTokens: 3_000,

    canUseImages: true,
    canUploadFiles: true,
    canUseAdvancedModels: true,
    canUseProModels: false,
    canUseWebSearch: false,

    badge: "پیشنهادی",
    isPopular: true,
    features: [
      "۱۲۰ پیام در روز",
      "دسترسی به مدل‌های Plus",
      "مناسب تولید محتوا، تحلیل و کدنویسی",
      "۳۰ تصویر در ماه",
      "کانتکست بیشتر از پلن رایگان",
    ],
  },

  pro: {
    id: "pro",
    slug: "pro",
    name: "پرو",
    title: "پلن پرو",
    label: "پرو",
    nameFa: "پرو",
    nameEn: "Pro",
    description: "برای کاربران حرفه‌ای، تیم‌ها، توسعه‌دهنده‌ها و استفاده سنگین‌تر.",

    priceIrr: 6_990_000,
    monthlyPriceIrr: 6_990_000,
    priceToman: 699_000,
    monthlyPriceToman: 699_000,

    dailyMessages: 180,
    dailyMessageLimit: 180,
    monthlyMessages: 5_400,

    monthlyCredits: 24_000,
    maxMonthlyCredits: 24_000,

    monthlyImages: 100,
    maxImagesPerMonth: 100,
    imageCredits: 100,

    maxContextTokens: 64_000,
    maxOutputTokens: 5_000,

    canUseImages: true,
    canUploadFiles: true,
    canUseAdvancedModels: true,
    canUseProModels: true,
    canUseWebSearch: false,

    badge: "حرفه‌ای",
    features: [
      "۱۸۰ پیام در روز",
      "دسترسی به مدل‌های Pro",
      "مناسب تحلیل عمیق، پروژه و کدنویسی جدی",
      "۱۰۰ تصویر در ماه",
      "بالاترین سقف کانتکست و خروجی",
    ],
  },
};

export const plans = Object.values(planConfigs);
export const PLAN_CONFIGS = planConfigs;
export const PLANS = plans;

export function normalizePlan(plan?: string | null): PlanId {
  if (plan === "pro") return "pro";
  if (plan === "plus") return "plus";
  return "free";
}


export function normalizePlanId(plan?: string | null): PlanId {
  return normalizePlan(plan);
}

export function getPlanConfig(plan?: string | null): PlanConfig {
  return planConfigs[normalizePlan(plan)];
}

export function getAllPlanConfigs() {
  return plans;
}

export function getPlanPriceToman(plan?: string | null) {
  return getPlanConfig(plan).monthlyPriceToman;
}

export function getPlanDailyMessages(plan?: string | null) {
  return getPlanConfig(plan).dailyMessages;
}

export function getPlanMonthlyCredits(plan?: string | null) {
  return getPlanConfig(plan).monthlyCredits;
}

export function formatToman(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}
