import { planConfigs, formatToman } from "@/lib/billing/plans";
import { getModelsForPlan } from "@/lib/ai/model-catalog";
import { getImageModelsForPlan } from "@/lib/ai/image-model-catalog";

export async function GET() {
  const plans = Object.values(planConfigs).map((plan) => ({
    ...plan,
    priceLabel: formatToman(plan.priceToman),
    chatModels: getModelsForPlan(plan.id).map((model) => ({
      id: model.id,
      label: model.label,
      creditCost: model.creditCost,
      role: model.role,
    })),
    imageModels: getImageModelsForPlan(plan.id).map((model) => ({
      id: model.id,
      label: model.label,
      titleFa: model.titleFa,
      creditCost: model.creditCost,
    })),
  }));

  return Response.json({ plans });
}
