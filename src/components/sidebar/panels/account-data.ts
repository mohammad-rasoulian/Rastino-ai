import { formatToman, normalizePlanId, planConfigs } from "@/lib/billing/plans";

export type AccountUser = {
  id?: string;
  mobile?: string | null;
  email?: string | null;
  role?: string | null;
  plan?: string | null;
  status?: string | null;
  balance?: number | null;
};

export function formatBalance(balance?: number | null) {
  const safeBalance = Number(balance || 0);

  return `${safeBalance.toLocaleString("fa-IR")} اعتبار`;
}

export function getPlanLabel(plan?: string | null) {
  return planConfigs[normalizePlanId(plan)].nameFa;
}

function uniqueFeatures(features: string[]) {
  return Array.from(new Set(features));
}

export const accountPlans = Object.values(planConfigs).map((plan) => ({
  id: plan.id,
  name: plan.nameFa,
  nameEn: plan.nameEn,
  badge: plan.badge,
  priceToman: plan.priceToman,
  price:
    plan.priceToman === 0
      ? "رایگان"
      : `${formatToman(plan.priceToman)} / ماه`,
  description: plan.description,
  features: uniqueFeatures([
    `${plan.monthlyCredits.toLocaleString("fa-IR")} اعتبار ماهانه`,
    `${plan.dailyMessages.toLocaleString("fa-IR")} پیام روزانه`,
    `${plan.monthlyImages.toLocaleString("fa-IR")} تصویر ماهانه`,
    ...plan.features,
  ]),
  highlighted: plan.id === "plus",
}));
