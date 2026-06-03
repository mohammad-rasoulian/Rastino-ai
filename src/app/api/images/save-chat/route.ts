import { prisma } from "@/lib/prisma";
import {
  getRequestUser,
  isUnauthorizedError,
  unauthorizedResponse,
} from "@/lib/auth/request-user";

type SavedImage = {
  id?: string;
  url?: string;
  originalUrl?: string | null;
  prompt?: string;
  model?: string;
  style?: string;
  aspectRatio?: string;
  quality?: string;
  createdAt?: string;
};

function safeString(value: unknown, fallback = "") {
  return String(value || fallback).trim();
}

export async function POST(req: Request) {
  try {
    const user = await getRequestUser();
    const body = await req.json().catch(() => ({}));

    const prompt = safeString(body.prompt);
    const finalPrompt = safeString(body.finalPrompt, prompt);
    const model = safeString(body.model);
    const style = safeString(body.style);
    const aspectRatio = safeString(body.aspectRatio);
    const quality = safeString(body.quality);
    const presetId = safeString(body.presetId);
    const brandKit =
      body.brandKit && typeof body.brandKit === "object"
        ? body.brandKit
        : undefined;

    const images = Array.isArray(body.images)
      ? (body.images as SavedImage[])
          .map((image) => ({
            id: safeString(image.id),
            url: safeString(image.url),
            originalUrl:
              typeof image.originalUrl === "string" ? image.originalUrl : null,
            prompt: safeString(image.prompt, finalPrompt || prompt),
            model: safeString(image.model, model),
            style: safeString(image.style, style),
            aspectRatio: safeString(image.aspectRatio, aspectRatio),
            quality: safeString(image.quality, quality),
            createdAt: safeString(image.createdAt),
          }))
          .filter((image) => image.url)
      : [];

    if (!prompt) {
      return Response.json(
        { error: "پرامپت تصویر الزامی است." },
        { status: 400 }
      );
    }

    if (images.length === 0) {
      return Response.json(
        { error: "هیچ تصویری برای ذخیره وجود ندارد." },
        { status: 400 }
      );
    }

    const shortPrompt =
      prompt.length > 32 ? `${prompt.slice(0, 32)}...` : prompt;

    const title = `🖼️ تصویر: ${shortPrompt}`;

    const assistantPayload = {
      type: "image_result",
      prompt,
      finalPrompt,
      model,
      style,
      aspectRatio,
      quality,
      brandKit,
      presetId: presetId || undefined,
      images,
    };

    const chat = await prisma.chat.create({
      data: {
        title,
        type: "image",
        userId: user.id,
        messages: {
          create: [
            {
              role: "user",
              content: prompt,
              userId: user.id,
              metadata: JSON.stringify({
                type: "image_prompt",
                finalPrompt,
                brandKit,
                presetId: presetId || undefined,
              }),
            },
            {
              role: "assistant",
              content: `__RASTINO_IMAGE__${JSON.stringify(assistantPayload)}`,
              userId: user.id,
              model,
              provider: "image",
              metadata: JSON.stringify({
                type: "image_result",
                imageCount: images.length,
                brandKit,
                presetId: presetId || undefined,
                finalPrompt,
              }),
            },
          ],
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
      },
    });

    await prisma.$transaction(
      images.map((image) =>
        prisma.imageGeneration.create({
          data: {
            userId: user.id,
            chatId: chat.id,
            prompt: image.prompt || finalPrompt || prompt,
            model: image.model || model,
            style: image.style || style || null,
            aspectRatio: image.aspectRatio || aspectRatio || null,
            quality: image.quality || quality || null,
            imageUrl: image.url,
            metadata: JSON.stringify({
              source: "save-chat",
              originalUrl: image.originalUrl,
              imageId: image.id || undefined,
              createdAt: image.createdAt || undefined,
              brandKit,
              presetId: presetId || undefined,
              finalPrompt,
            }),
          },
        })
      )
    );

    console.log("[IMAGE CHAT SAVED]", {
      chatId: chat.id,
      userId: user.id,
      title: chat.title,
      type: chat.type,
      imageCount: images.length,
    });

    return Response.json({
      ok: true,
      chat,
    });
  } catch (error) {
    if (isUnauthorizedError(error)) return unauthorizedResponse();

    console.error("[IMAGE SAVE CHAT ERROR]", error);

    return Response.json(
      { error: "ذخیره چت تصویری ناموفق بود." },
      { status: 500 }
    );
  }
}
