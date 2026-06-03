import { prisma } from "@/lib/prisma";
import {
  getRequestUser,
  isUnauthorizedError,
  unauthorizedResponse,
} from "@/lib/auth/request-user";
import { getPlanConfig } from "@/lib/billing/plans";
import { generateGapGptImage } from "@/lib/ai/gapgpt-image";
import {
  canAdminUseImageModel,
  canUseImageModel,
  getDefaultImageModelForPlan,
  getRastinoImageModel,
} from "@/lib/ai/image-model-catalog";

function getMonthStart() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  return start;
}

async function getMonthlyImageCount(userId: string) {
  return prisma.usageLog.count({
    where: {
      userId,
      scope: "image",
      action: "generate",
      createdAt: {
        gte: getMonthStart(),
      },
    },
  });
}

async function getMonthlyCreditUsage(userId: string) {
  const result = await prisma.usageLog.aggregate({
    where: {
      userId,
      createdAt: {
        gte: getMonthStart(),
      },
    },
    _sum: {
      creditCost: true,
    },
  });

  return result._sum.creditCost || 0;
}

function normalizeAspectRatio(value: string) {
  if (value === "1:1") return "1024x1024";
  if (value === "16:9") return "1792x1024";
  if (value === "9:16") return "1024x1792";
  if (value === "4:3") return "1536x1024";
  if (value === "3:4") return "1024x1536";

  return "1024x1024";
}

function normalizeImageCount(value: unknown) {
  const count = Number(value);

  if (!Number.isFinite(count)) return 1;
  if (count < 1) return 1;
  if (count > 4) return 4;

  return Math.floor(count);
}

function normalizeString(value: unknown) {
  return String(value || "").trim();
}

export async function POST(req: Request) {
  try {
    const user = await getRequestUser();
    const body = await req.json().catch(() => ({}));

    const prompt = normalizeString(body.prompt);
    const requestedModel = normalizeString(body.model);
    const aspectRatio = normalizeString(body.aspectRatio) || "1:1";
    const style = normalizeString(body.style);
    const quality = normalizeString(body.quality);
    const negativePrompt = normalizeString(body.negativePrompt);
    const presetId = normalizeString(body.presetId);
    const imageCount = normalizeImageCount(body.imageCount);
    const brandKit =
      body.brandKit && typeof body.brandKit === "object"
        ? body.brandKit
        : undefined;

    if (!prompt) {
      return Response.json(
        { error: "پرامپت تصویر الزامی است." },
        { status: 400 }
      );
    }

    const planConfig = getPlanConfig(user.plan);
    const monthlyImageCount = await getMonthlyImageCount(user.id);

    if (monthlyImageCount + imageCount > planConfig.monthlyImages) {
      return Response.json(
        {
          error: `محدودیت تصویر ماهانه پلن ${planConfig.nameFa} تمام شده است.`,
          code: "MONTHLY_IMAGE_LIMIT_REACHED",
          monthlyLimit: planConfig.monthlyImages,
          used: monthlyImageCount,
          requested: imageCount,
        },
        { status: 429 }
      );
    }

    const defaultModel = getDefaultImageModelForPlan(user.plan);
    const safeRequestedModel = getRastinoImageModel(requestedModel)
      ? requestedModel
      : defaultModel;

    const canUseRequestedModel =
      user.role === "admin"
        ? canAdminUseImageModel(safeRequestedModel)
        : canUseImageModel(user.plan, safeRequestedModel);

    const selectedModel = canUseRequestedModel ? safeRequestedModel : defaultModel;

    console.log("[IMAGE MODEL SELECTED]", {
      requestedModel,
      safeRequestedModel,
      selectedModel,
      defaultModel,
      userPlan: user.plan,
      userRole: user.role,
    });

    const modelInfo = getRastinoImageModel(selectedModel);
    const creditCostPerImage = modelInfo?.creditCost || 1;
    const totalCreditCost = creditCostPerImage * imageCount;
    const monthlyCreditUsage = await getMonthlyCreditUsage(user.id);

    if (monthlyCreditUsage + totalCreditCost > planConfig.monthlyCredits) {
      return Response.json(
        {
          error: `اعتبار ماهانه پلن ${planConfig.nameFa} کافی نیست.`,
          code: "MONTHLY_CREDIT_LIMIT_REACHED",
          monthlyLimit: planConfig.monthlyCredits,
          used: monthlyCreditUsage,
          requested: totalCreditCost,
        },
        { status: 429 }
      );
    }

    const generatedImages: {
      url: string;
      originalUrl: string | null;
      model: string;
    }[] = [];

    for (let index = 0; index < imageCount; index += 1) {
      const result = await generateGapGptImage({
        model: selectedModel,
        prompt,
        size: normalizeAspectRatio(aspectRatio),
      });

      generatedImages.push({
        url: result.url,
        originalUrl: result.originalUrl,
        model: result.model,
      });
    }

    await prisma.$transaction(
      generatedImages.map((image) =>
        prisma.usageLog.create({
          data: {
            userId: user.id,
            scope: "image",
            action: "generate",
            model: image.model,
            provider: "gapgpt",
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            costUsd: 0,
            creditCost: creditCostPerImage,
          },
        })
      )
    );

    await prisma.$transaction(
      generatedImages.map((image) =>
        prisma.imageGeneration.create({
          data: {
            userId: user.id,
            prompt,
            negativePrompt: negativePrompt || null,
            model: image.model,
            style: style || null,
            aspectRatio: aspectRatio || null,
            quality: quality || null,
            imageUrl: image.url,
            metadata: JSON.stringify({
              provider: "gapgpt",
              originalUrl: image.originalUrl,
              requestedModel,
              selectedModel,
              presetId: presetId || undefined,
              brandKit,
              storage: "public/generated/images",
              creditCost: creditCostPerImage,
            }),
          },
        })
      )
    );

    console.log("[IMAGE GENERATED]", {
      provider: "gapgpt",
      requestedModel,
      safeRequestedModel,
      selectedModel,
      userPlan: user.plan,
      userRole: user.role,
      imageCount: generatedImages.length,
      creditCost: totalCreditCost,
      firstImageUrl: generatedImages[0]?.url,
    });

    return Response.json({
      imageUrl: generatedImages[0]?.url,
      originalUrl: generatedImages[0]?.originalUrl,
      images: generatedImages,
      model: selectedModel,
      provider: "gapgpt",
      creditCost: totalCreditCost,
      creditCostPerImage,
      imageCount: generatedImages.length,
      storage: "public/generated/images",
    });
  } catch (error) {
    if (isUnauthorizedError(error)) return unauthorizedResponse();

    console.error("[IMAGE GENERATE ERROR]", error);

    return Response.json(
      {
        error: "تولید تصویر ناموفق بود. کمی بعد دوباره تلاش کن.",
        detail: error instanceof Error ? error.message : "unknown_error",
      },
      { status: 500 }
    );
  }
}
