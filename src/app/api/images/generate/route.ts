import { prisma } from "@/lib/prisma";
import { storeGeneratedImageLocally } from "@/lib/images/store-generated-image";
import {
  getRequestUser,
  isUnauthorizedError,
  unauthorizedResponse,
} from "@/lib/auth/request-user";
import { getPlanConfig } from "@/lib/billing/plans";
import { generateAvalaiImage } from "@/lib/ai/avalai-image";
import {
  canAdminUseImageModel,
  canUseImageModel,
  getDefaultImageModelForPlan,
  getImageModelCreditCost,
  getRastinoImageModel,
} from "@/lib/ai/image-model-catalog";

function getMonthStart() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getDayStart() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

function normalizeAspectRatio(aspectRatio: string) {
  if (aspectRatio === "16:9") return "1792x1024";
  if (aspectRatio === "9:16") return "1024x1792";
  if (aspectRatio === "4:3") return "1024x768";
  if (aspectRatio === "3:4") return "768x1024";
  return "1024x1024";
}

function normalizeImageCount(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 1;
  return Math.min(Math.max(Math.floor(numberValue), 1), 3);
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

async function getDailyImageCount(userId: string) {
  return prisma.usageLog.count({
    where: {
      userId,
      scope: "image",
      action: "generate",
      createdAt: {
        gte: getDayStart(),
      },
    },
  });
}

export async function POST(req: Request) {
  try {
    const user = await getRequestUser();
    const planConfig = getPlanConfig(user.plan);

    const body = await req.json().catch(() => ({}));

    const prompt = String(body.prompt || "").trim();
    const requestedModel = String(body.model || "").trim();
    const aspectRatio = String(body.aspectRatio || "1:1");
    const imageCount = normalizeImageCount(body.imageCount);

    if (!prompt) {
      return Response.json(
        { error: "پرامپت تصویر الزامی است." },
        { status: 400 }
      );
    }

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

    if (user.plan !== "plus" && user.plan !== "pro") {
      const dailyImageCount = await getDailyImageCount(user.id);

      if (dailyImageCount + imageCount > 1) {
        return Response.json(
          {
            error: "در پلن رایگان فقط روزی ۱ تصویر می‌توانی بسازی.",
            code: "FREE_DAILY_IMAGE_LIMIT_REACHED",
            dailyLimit: 1,
            used: dailyImageCount,
            requested: imageCount,
          },
          { status: 429 }
        );
      }
    }

    const defaultModel = getDefaultImageModelForPlan(user.plan);
    const requestedExists = getRastinoImageModel(requestedModel);
    const safeRequestedModel = requestedExists ? requestedModel : defaultModel;

    const canUseRequested =
      user.role === "admin"
        ? canAdminUseImageModel(safeRequestedModel)
        : canUseImageModel(user.plan, safeRequestedModel);

    const selectedModel = canUseRequested ? safeRequestedModel : defaultModel;
    const modelInfo = getRastinoImageModel(selectedModel);

    if (!modelInfo) {
      return Response.json(
        { error: "مدل تصویر معتبر نیست." },
        { status: 400 }
      );
    }

    const generatedImages = [];

    for (let index = 0; index < imageCount; index += 1) {
      const result = await generateAvalaiImage({
        model: modelInfo,
        prompt,
        size: normalizeAspectRatio(aspectRatio),
      });

      generatedImages.push(
        ...result.images.map((image) => ({
          url: image.url,
          originalUrl: image.originalUrl || image.url,
          model: result.model,
        }))
      );
    }

    const externalImages = generatedImages.slice(0, imageCount);

    if (externalImages.length === 0) {
      throw new Error("No image returned from AvalAI.");
    }

    const finalImages = await Promise.all(
      externalImages.map(async (image) => {
        const stored = await storeGeneratedImageLocally(image.url);

        return {
          ...image,
          url: stored.url,
          originalUrl: image.originalUrl || stored.originalUrl || image.url,
        };
      })
    );

    const creditCostPerImage = getImageModelCreditCost(selectedModel);
    const totalCreditCost = creditCostPerImage * finalImages.length;

    await prisma.$transaction([
      ...finalImages.map((image) =>
        prisma.usageLog.create({
          data: {
            userId: user.id,
            scope: "image",
            action: "generate",
            model: image.model,
            provider: "avalai",
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            costUsd: 0,
            creditCost: creditCostPerImage,
          },
        })
      ),
      ...finalImages.map((image) =>
        prisma.imageGeneration.create({
          data: {
            userId: user.id,
            prompt,
            negativePrompt: String(body.negativePrompt || "").trim() || null,
            model: image.model,
            style: String(body.style || "") || null,
            aspectRatio,
            quality: String(body.quality || "") || null,
            imageUrl: image.url,
            metadata: JSON.stringify({
              provider: "avalai",
              originalUrl: image.originalUrl,
              requestedModel,
              selectedModel,
              creditCost: creditCostPerImage,
              imageCount: finalImages.length,
              size: normalizeAspectRatio(aspectRatio),
            }),
          },
        })
      ),
    ]);

    return Response.json({
      imageUrl: finalImages[0]?.url,
      originalUrl: finalImages[0]?.originalUrl,
      images: finalImages,
      model: selectedModel,
      provider: "avalai",
      creditCost: totalCreditCost,
      creditCostPerImage,
      imageCount: finalImages.length,
    });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return unauthorizedResponse();
    }

    console.error("[AVALAI IMAGE GENERATE ERROR]", error);

    const message = error instanceof Error ? error.message : "unknown_error";
    const insufficientCredit =
      message.toLowerCase().includes("insufficient credit") ||
      message.toLowerCase().includes("remaining balance");

    return Response.json(
      {
        error: insufficientCredit
          ? "اعتبار سرویس تولید تصویر کافی نیست. لطفاً بعداً دوباره تلاش کنید."
          : "تولید تصویر ناموفق بود. کمی بعد دوباره تلاش کن.",
        code: insufficientCredit ? "AVALAI_INSUFFICIENT_CREDIT" : "IMAGE_GENERATION_FAILED",
        detail: message,
      },
      { status: insufficientCredit ? 402 : 500 }
    );
  }
}
