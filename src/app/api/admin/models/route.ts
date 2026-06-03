import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
  estimateMessageCostIrr,
  getDefaultModelForPlan,
  getRastinoModel,
  normalizePlan,
  rastinoModels,
  type RastinoPlanTier,
} from "@/lib/ai/model-catalog";

const planLabels: Record<RastinoPlanTier, string> = {
  free: "رایگان",
  plus: "پلاس",
  pro: "پرو",
};

async function ensureDefaultModelSetting(plan: RastinoPlanTier) {
  const key = `settings.defaultModel.${plan}`;
  const fallback = getDefaultModelForPlan(plan);

  await prisma.siteContent.upsert({
    where: { key },
    update: {},
    create: {
      key,
      label: `مدل پیش‌فرض پلن ${planLabels[plan]}`,
      group: "settings",
      type: "select",
      value: fallback,
      isPublic: false,
    },
  });
}

async function getDefaultModels() {
  await Promise.all([
    ensureDefaultModelSetting("free"),
    ensureDefaultModelSetting("plus"),
    ensureDefaultModelSetting("pro"),
  ]);

  const settings = await prisma.siteContent.findMany({
    where: {
      key: {
        in: [
          "settings.defaultModel.free",
          "settings.defaultModel.plus",
          "settings.defaultModel.pro",
        ],
      },
    },
  });

  return {
    free:
      settings.find((item) => item.key === "settings.defaultModel.free")
        ?.value || getDefaultModelForPlan("free"),
    plus:
      settings.find((item) => item.key === "settings.defaultModel.plus")
        ?.value || getDefaultModelForPlan("plus"),
    pro:
      settings.find((item) => item.key === "settings.defaultModel.pro")
        ?.value || getDefaultModelForPlan("pro"),
  };
}

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json({ error: "دسترسی مدیریت ندارید." }, { status: 403 });
  }

  const defaultModels = await getDefaultModels();

  return Response.json({
    defaultModels,
    models: rastinoModels.map((model) => ({
      ...model,
      estimatedCostIrr: estimateMessageCostIrr({
        modelId: model.id,
        inputTokens: 1000,
        outputTokens: 700,
      }),
      isDefault: defaultModels[model.tier] === model.id,
    })),
  });
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json({ error: "دسترسی مدیریت ندارید." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = normalizePlan(String(body.plan || ""));
  const modelId = String(body.modelId || "").trim();
  const model = getRastinoModel(modelId);

  if (!model) {
    return Response.json({ error: "مدل معتبر نیست." }, { status: 400 });
  }

  if (model.tier !== plan) {
    return Response.json(
      { error: "این مدل متعلق به پلن انتخاب‌شده نیست." },
      { status: 400 }
    );
  }

  const key = `settings.defaultModel.${plan}`;

  await prisma.siteContent.upsert({
    where: { key },
    update: {
      value: model.id,
    },
    create: {
      key,
      label: `مدل پیش‌فرض پلن ${planLabels[plan]}`,
      group: "settings",
      type: "select",
      value: model.id,
      isPublic: false,
    },
  });

  await prisma.adminAction.create({
    data: {
      adminId: admin.id,
      action: "model.default.update",
      targetType: "AiModel",
      targetId: model.id,
      description: `مدل پیش‌فرض پلن ${planLabels[plan]} به ${model.label} تغییر کرد.`,
      metadata: JSON.stringify({
        plan,
        modelId: model.id,
        label: model.label,
        creditCost: model.creditCost,
      }),
    },
  });

  const defaultModels = await getDefaultModels();

  return Response.json({
    ok: true,
    defaultModels,
  });
}
