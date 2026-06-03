import { prisma } from "@/lib/prisma";
import { getRequestUser, isUnauthorizedError, unauthorizedResponse } from "@/lib/auth/request-user";
import { hasGapGptKey, streamGapGptText } from "@/lib/ai/gapgpt";
import type { AiMessageContent } from "@/lib/ai/gapgpt";
import { hasOpenRouterKey, streamOpenRouterText } from "@/lib/ai/openrouter";
import { streamAvalai } from "@/lib/ai/avalai";
import { buildRastinoSystemPrompt } from "@/lib/ai/response-style";
import { getPlanConfig } from "@/lib/billing/plans";
import {
  canUseModel,
  getDefaultModelForPlan,
  getModelCreditCost,
  getRastinoModel,
  getProviderModel,} from "@/lib/ai/model-catalog";

type RouteContext = {
  params: Promise<{
    chatId: string;
  }>;
};

async function getOwnedChatForRequest(chatId: string, userId: string) {
  return prisma.chat.findFirst({
    where: {
      id: chatId,
      userId,
    },
    select: {
      id: true,
      userId: true,
      type: true,
      title: true,
    },
  });
}


function getPrimaryAiProvider() {
  const provider = process.env.AI_PROVIDER || process.env.CHAT_PROVIDER || "openrouter";
  return provider === "avalai" ? "avalai" : "openrouter";
}

function shouldUseAvalai() {
  return getPrimaryAiProvider() === "avalai" && Boolean(process.env.AVALAI_API_KEY);
}


function shouldUseGapGptChat() {
  const provider = process.env.AI_PROVIDER || process.env.CHAT_PROVIDER || "";
  return provider === "gapgpt" && hasGapGptKey();
}


function chatNotFoundResponse() {
  return Response.json(
    { error: "چت پیدا نشد یا به این حساب کاربری تعلق ندارد." },
    { status: 404 }
  );
}



type AiUsageSummary = {
  reasoningTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
};

type AiProviderResult = {
  model: string;
  provider: string;
  stream: AsyncGenerator<string>;
  getUsage?: () => AiUsageSummary | null;
};

type ChatImageAttachment = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

type AiChatMessage = {
  role: "system" | "user" | "assistant";
  content: AiMessageContent;
};

function buildMockAssistantReply(content: string) {
  return `# پاسخ راستینو

سؤال تو این بود:

> ${content}

## وضعیت فعلی

- چت به **Realtime Streaming** وصل است.
- Markdown، Code Highlight و Math Renderer فعال هستند.
- موتور لحن انسانی راستینو فعال است.
- اگر GapGPT یا OpenRouter در دسترس نباشد، این پاسخ آزمایشی نمایش داده می‌شود.

## تست کد

\`\`\`tsx
export function Rastino() {
  return <div>سلام از راستینو</div>;
}
\`\`\`

اتصال مدل‌ها آماده است؛ GapGPT به‌عنوان provider اصلی استفاده می‌شود.`;
}

function splitForStreaming(text: string) {
  return text.split(/(\s+)/).filter(Boolean);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeImageAttachments(value: unknown): ChatImageAttachment[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      name: String(item?.name || "image"),
      type: String(item?.type || ""),
      size: Number(item?.size || 0),
      dataUrl: String(item?.dataUrl || ""),
    }))
    .filter((item) => {
      const validType = item.type.startsWith("image/");
      const validDataUrl = /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(
        item.dataUrl
      );
      const validSize = item.size > 0 && item.size <= 3 * 1024 * 1024;

      return validType && validDataUrl && validSize;
    })
    .slice(0, 4);
}

function attachImagesToLastUserMessage(
  messages: AiChatMessage[],
  images: ChatImageAttachment[],
  textFallback: string
) {
  if (images.length === 0) return messages;

  const nextMessages = [...messages];
  const lastUserIndex = [...nextMessages]
    .reverse()
    .findIndex((message) => message.role === "user");

  const realIndex =
    lastUserIndex === -1 ? -1 : nextMessages.length - 1 - lastUserIndex;

  const imageParts: AiMessageContent = [
    {
      type: "text",
      text: textFallback || "این تصویر را بررسی کن و اگر متن دارد، بخوان.",
    },
    ...images.map((image) => ({
      type: "image_url" as const,
      image_url: {
        url: image.dataUrl,
      },
    })),
  ];

  if (realIndex === -1) {
    return [
      ...nextMessages,
      {
        role: "user" as const,
        content: imageParts,
      },
    ];
  }

  const previousContent = nextMessages[realIndex].content;
  const previousText =
    typeof previousContent === "string" ? previousContent : textFallback;

  nextMessages[realIndex] = {
    ...nextMessages[realIndex],
    content: [
      {
        type: "text",
        text: previousText || textFallback || "این تصویر را بررسی کن.",
      },
      ...images.map((image) => ({
        type: "image_url" as const,
        image_url: {
          url: image.dataUrl,
        },
      })),
    ],
  };

  return nextMessages;
}

function getVisionModelForPlan(plan?: string | null) {
  if (plan === "pro") return "gemini-3.1-pro-preview";
  if (plan === "plus") return "gpt-4o-mini";

  return "gemini-2.5-flash-lite";
}


function isLocalChatQuotaBypassEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.LOCAL_BYPASS_CHAT_QUOTA === "true"
  );
}

async function getTodayChatMessageCount(userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return prisma.usageLog.count({
    where: {
      userId,
      scope: "chat",
      action: "message",
      createdAt: {
        gte: startOfDay,
      },
    },
  });
}


function getMonthStart() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  return start;
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

async function getConfiguredDefaultModelForPlan(plan?: string | null) {
  const normalizedPlan = plan === "pro" ? "pro" : plan === "plus" ? "plus" : "free";
  const fallback = getDefaultModelForPlan(normalizedPlan);
  const fallbackModelId = fallback;

  const setting = await prisma.siteContent.findUnique({
    where: {
      key: `settings.defaultModel.${normalizedPlan}`,
    },
  });

  const configuredModel = setting?.value || fallbackModelId;

  if (canUseModel(normalizedPlan, configuredModel)) {
    return configuredModel;
  }

  return fallbackModelId;
}

async function getChatMessagesForAi(chatId: string) {
  const messages = await prisma.message.findMany({
    where: {
      chatId,
      content: {
        not: {
          startsWith: "__RASTINO_IMAGE__",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 20,
    select: {
      role: true,
      content: true,
    },
  });

  return messages
    .filter(
      (message) => message.role === "user" || message.role === "assistant"
    )
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content,
    }));
}

async function createMockStream(content: string): Promise<AiProviderResult> {
  async function* stream() {
    const mockText = buildMockAssistantReply(content);
    const chunks = splitForStreaming(mockText);

    for (const chunk of chunks) {
      yield chunk;
      await wait(24);
    }
  }

  return {
    model: "mock-rastino",
    provider: "mock",
    stream: stream(),
  };
}


function normalizeShortUserText(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .trim()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[!؟?.,،؛:ـ]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function getLatestUserText(messages: Array<{ role: string; content: unknown }>) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "user" && typeof message.content === "string") {
      return message.content;
    }
  }

  return "";
}

function buildFastLocalReplyIfPossible(
  messages: Array<{ role: string; content: unknown }>
) {
  const latestUserText = normalizeShortUserText(getLatestUserText(messages));

  const simpleGreetings = new Set([
    "سلام",
    "درود",
    "سلام وقت بخیر",
    "سلام خسته نباشید",
    "سلام عزیزم",
    "hi",
    "hello",
    "hey",
  ]);

  if (!simpleGreetings.has(latestUserText)) {
    return null;
  }

  return "سلام! من آماده‌ام. چطور می‌تونم کمکت کنم؟";
}

async function createFastLocalStream(content: string): Promise<AiProviderResult> {
  async function* stream() {
    yield content;
  }

  return {
    model: "rastino-fast-local",
    provider: "mock",
    stream: stream(),
    getUsage: () => ({
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      reasoningTokens: 0,
      costUsd: 0,
    }),
  };
}


async function resolveAiProvider({


  model,
  messages,
  signal,
  fallbackContent,
}: {
  model: string;
  messages: AiChatMessage[];
  signal?: AbortSignal;
  fallbackContent: string;
}): Promise<AiProviderResult> {
  const fastLocalReply = buildFastLocalReplyIfPossible(messages);

  if (fastLocalReply) {
    console.info("[FAST LOCAL REPLY]", {
      reason: "simple_greeting",
      selectedModel: model,
    });

    return createFastLocalStream(fastLocalReply);
  }

  if (shouldUseGapGptChat()) {
    try {
      const ai = await streamGapGptText({
        model,
        messages,
        signal,
      });

      return {
        model: ai.model,
        provider: ai.provider || "gapgpt",
        stream: ai.stream,
      };
    } catch (error) {
      console.error("[GAPGPT STREAM ERROR]", error);
    }
  }

  if (shouldUseAvalai()) {
    try {
      const ai = await streamAvalai({
        model: getProviderModel(model || process.env.AVALAI_DEFAULT_MODEL),
        messages,
        signal,
      });

      return {
        model: ai.model,
        provider: "avalai",
        stream: ai.stream,
        getUsage: ai.getUsage,
      };
    } catch (error) {
      console.error("[AVALAI STREAM ERROR]", error);
    }
  }

  if (hasOpenRouterKey()) {
    try {
      const ai = await streamOpenRouterText({
        model: process.env.OPENROUTER_DEFAULT_MODEL,
        messages,
        signal,
      });

      return {
        model: ai.model,
        provider: "openrouter",
        stream: ai.stream,
        getUsage: ai.getUsage,
      };
    } catch (error) {
      console.error("[OPENROUTER STREAM ERROR]", error);
    }
  }

  if (process.env.AI_ALLOW_MOCK_FALLBACK === "true") {
    console.warn("[AI PROVIDER FALLBACK] Using mock stream because no real provider succeeded.");
    return createMockStream(fallbackContent);
  }

  throw new Error(
    "هیچ provider واقعی برای چت فعال نیست یا درخواست به API شکست خورد. OPENROUTER_MODE/OPENROUTER_API_KEY یا GAPGPT_MODE/GAPGPT_API_KEY را بررسی کنید."
  );
}

export async function GET(_req: Request, context: RouteContext) {
  const { chatId } = await context.params;
  const user = await getRequestUser().catch((error) => {
    if (isUnauthorizedError(error)) return null;
    throw error;
  });

  if (!user) {
    return unauthorizedResponse();
  }

  // GET_CHAT_OWNERSHIP_GUARD
  const ownedChat = await getOwnedChatForRequest(chatId, user.id);

  if (!ownedChat) {
    return chatNotFoundResponse();
  }



  const messages = await prisma.message.findMany({
    where: {
      chatId,
      chat: {
        userId: user.id,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return Response.json({ messages });
}

export async function POST(req: Request, context: RouteContext) {
  const { chatId } = await context.params;
  const user = await getRequestUser().catch((error) => {
    if (isUnauthorizedError(error)) return null;
    throw error;
  });

  if (!user) {
    return unauthorizedResponse();
  }

  // POST_CHAT_OWNERSHIP_GUARD
  const ownedChat = await getOwnedChatForRequest(chatId, user.id);

  if (!ownedChat) {
    return chatNotFoundResponse();
  }


  const body = await req.json().catch(() => ({}));

  const imageAttachments = normalizeImageAttachments(body.attachments);
  const content = String(body.content || "").trim();
  const messageContent =
    content ||
    (imageAttachments.length > 0
      ? "تصویر پیوست شد. لطفاً تصویر را بررسی کن و اگر متن دارد، آن را بخوان."
      : "");
  const requestedModel = String(body.model || "").trim();
  const requestedToneMode = String(body.toneMode || "adaptive-human").trim();
  const requestedDeepThinking = Boolean(body.deepThinking);
  const requestedSystemPrompt = String(body.systemPrompt || "").trim().slice(0, 4000);

  if (!messageContent) {
    return Response.json(
      { error: "Message content is required" },
      { status: 400 }
    );
  }

  const planConfig = getPlanConfig(user.plan);
  const todayMessageCount = await getTodayChatMessageCount(user.id);

  if (!isLocalChatQuotaBypassEnabled() && todayMessageCount >= planConfig.dailyMessages) {
    return Response.json(
      {
        error: `محدودیت پیام روزانه پلن ${planConfig.nameFa} تمام شده است.`,
        code: "DAILY_MESSAGE_LIMIT_REACHED",
        dailyLimit: planConfig.dailyMessages,
      },
      { status: 429 }
    );
  }

  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId: user.id,
    },
  });

  if (!chat) {
    return Response.json(
      {
        error: "Chat not found",
        code: "CHAT_NOT_FOUND",
      },
      { status: 404 }
    );
  }

  const defaultModel = await getConfiguredDefaultModelForPlan(user.plan);
  const safeRequestedModel = getRastinoModel(requestedModel)
    ? requestedModel
    : defaultModel;

  const allowedModel = canUseModel(user.plan, safeRequestedModel)
    ? safeRequestedModel
    : defaultModel;

  const selectedModel =
    imageAttachments.length > 0 ? getVisionModelForPlan(user.plan) : allowedModel;

  const chatCreditCost = getModelCreditCost(selectedModel);
  const monthlyCreditUsage = await getMonthlyCreditUsage(user.id);

  if (!isLocalChatQuotaBypassEnabled() && monthlyCreditUsage + chatCreditCost > planConfig.monthlyCredits) {
    return Response.json(
      {
        error: `اعتبار ماهانه پلن ${planConfig.nameFa} کافی نیست.`,
        code: "MONTHLY_CREDIT_LIMIT_REACHED",
        monthlyLimit: planConfig.monthlyCredits,
        used: monthlyCreditUsage,
        requested: chatCreditCost,
      },
      { status: 429 }
    );
  }


  await prisma.message.create({
    data: {
      content: messageContent,
      role: "user",
      chatId,
      userId: user.id,
      model: selectedModel,
      metadata: JSON.stringify({
        toneMode: requestedToneMode,
        requestedModel,
        deepThinking: requestedDeepThinking,
        systemPrompt: requestedSystemPrompt || undefined,
        files: Array.isArray(body.files) ? body.files : [],
        attachments: imageAttachments.map((image) => ({
          name: image.name,
          type: image.type,
          size: image.size,
        })),
        hasImages: imageAttachments.length > 0,
      }),
    },
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let finalText = "";
      let finalModel = selectedModel;
      let provider = "mock";

      try {
        const history = await getChatMessagesForAi(chatId);

        const messages = [
          {
            role: "system" as const,
            content: [
              buildRastinoSystemPrompt({
                userMessage: messageContent,
                toneMode: requestedToneMode,
              }),
              requestedSystemPrompt
                ? `دستور اختصاصی کاربر:\n${requestedSystemPrompt}`
                : "",
              requestedDeepThinking
                ? "برای مسائل پیچیده، قبل از پاسخ نهایی با دقت بیشتری تحلیل کن و پاسخ را منظم‌تر ارائه بده."
                : "",
            ]
              .filter(Boolean)
              .join("\n\n"),
          },
          ...history,
        ] satisfies AiChatMessage[];

        const aiMessages = attachImagesToLastUserMessage(
          messages,
          imageAttachments,
          messageContent
        );

        const ai = await resolveAiProvider({
          model: selectedModel,
          messages: aiMessages,
          fallbackContent: messageContent,
        });

        finalModel = ai.model;
        provider = ai.provider;

        for await (const token of ai.stream) {
          finalText += token;
          controller.enqueue(encoder.encode(token));
        }

        const aiUsage = ai.getUsage?.() || null;
        const inputTokens = aiUsage?.promptTokens || 0;
        const outputTokens = aiUsage?.completionTokens || 0;
        const totalTokens = aiUsage?.totalTokens || 0;
        const costUsd = aiUsage?.costUsd || 0;
        const reasoningTokens = aiUsage?.reasoningTokens || 0;

        await prisma.message.create({
          data: {
            content: finalText,
            role: "assistant",
            chatId,
            userId: user.id,
            model: finalModel,
            provider,
            inputTokens,
            outputTokens,
            totalTokens,
            costUsd,
            metadata: JSON.stringify({
              toneMode: requestedToneMode,
              requestedModel,
              internalSelectedModel: selectedModel,
              finalModel,
              providerModel: finalModel,
              usage: aiUsage,
              reasoningTokens,
              deepThinking: requestedDeepThinking,
              systemPrompt: requestedSystemPrompt || undefined,
            }),
          },
        });

        await prisma.usageLog.create({
          data: {
            userId: user.id,
            scope: "chat",
            action: "message",
            model: finalModel,
            provider,
            inputTokens,
            outputTokens,
            totalTokens,
            costUsd,
            creditCost: chatCreditCost,
          },
        });

        controller.close();
      } catch (error) {
        console.error("[CHAT STREAM ERROR]", error);

        const fallbackText =
          "\n\nخطا در دریافت پاسخ از مدل. لطفاً چند لحظه بعد دوباره تلاش کن.";

        finalText += fallbackText;
        controller.enqueue(encoder.encode(fallbackText));

        if (finalText.trim()) {
          await prisma.message.create({
            data: {
              content: finalText,
              role: "assistant",
              chatId,
              userId: user.id,
              model: finalModel,
              provider,
              metadata: JSON.stringify({
                toneMode: requestedToneMode,
                requestedModel,
                selectedModel,
                error: true,
              }),
            },
          });
        }

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
      Connection: "keep-alive",
    },
  });
}
