import { OpenRouter } from "@openrouter/sdk";
import type { AiMessageContent } from "./gapgpt";

type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: AiMessageContent;
};

type StreamOpenRouterArgs = {
  messages: OpenRouterMessage[];
  model?: string;
  signal?: AbortSignal;
};

type OpenRouterTokenDetails = {
  audioTokens?: number;
  reasoningTokens?: number;
  reasoning_tokens?: number;
  cacheWriteTokens?: number;
  cachedTokens?: number;
  videoTokens?: number;
};

type OpenRouterUsageLike = {
  reasoningTokens?: number;
  reasoning_tokens?: number;
  promptTokens?: number;
  prompt_tokens?: number;
  completionTokens?: number;
  completion_tokens?: number;
  totalTokens?: number;
  total_tokens?: number;
  completionTokensDetails?: OpenRouterTokenDetails;
  completion_tokens_details?: OpenRouterTokenDetails;
  promptTokensDetails?: OpenRouterTokenDetails;
  prompt_tokens_details?: OpenRouterTokenDetails;
  cost?: number;
};

type OpenRouterStreamChunk = {
  choices?: {
    delta?: {
      content?: string;
    };
  }[];
  usage?: OpenRouterUsageLike;
};

export type OpenRouterUsageSummary = {
  reasoningTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
};

function getOpenRouterApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey?.trim()) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  return apiKey;
}

function createOpenRouterClient() {
  return new OpenRouter({
    apiKey: getOpenRouterApiKey(),
    httpReferer: process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
    appTitle: process.env.OPENROUTER_SITE_NAME || "Rastino",
  } as never);
}

function normalizeUsage(
  usage: OpenRouterUsageLike | undefined
): OpenRouterUsageSummary | null {
  if (!usage) return null;

  const completionDetails =
    usage.completionTokensDetails || usage.completion_tokens_details;

  return {
    reasoningTokens:
      usage.reasoningTokens ??
      usage.reasoning_tokens ??
      completionDetails?.reasoningTokens ??
      completionDetails?.reasoning_tokens ??
      0,
    promptTokens: usage.promptTokens ?? usage.prompt_tokens ?? 0,
    completionTokens: usage.completionTokens ?? usage.completion_tokens ?? 0,
    totalTokens: usage.totalTokens ?? usage.total_tokens ?? 0,
    costUsd: usage.cost ?? 0,
  };
}

export function hasOpenRouterKey() {
  const mode = process.env.OPENROUTER_MODE || "mock";

  if (mode !== "real") {
    return false;
  }

  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

export async function streamOpenRouterText({
  messages,
  model,
  signal,
}: StreamOpenRouterArgs) {
  const selectedModel =
    model ||
    process.env.OPENROUTER_DEFAULT_MODEL ||
    "deepseek/deepseek-v4-flash";

  const openrouter = createOpenRouterClient();
  let finalUsage: OpenRouterUsageSummary | null = null;

  const stream = await openrouter.chat.send({
    chatRequest: {
      model: selectedModel,
      messages: messages as never,
      stream: true,
    },
  } as never);

  async function* generator() {
    try {
      for await (const chunk of stream as unknown as AsyncIterable<OpenRouterStreamChunk>) {
        if (signal?.aborted) {
          break;
        }

        const content = chunk.choices?.[0]?.delta?.content;

        if (content) {
          yield content;
        }

        const usage = normalizeUsage(chunk.usage);

        if (usage) {
          finalUsage = usage;
        }
      }
    } finally {
      if (finalUsage) {
        console.log("[OPENROUTER USAGE]", {
          model: selectedModel,
          ...finalUsage,
        });
      }
    }
  }

  return {
    model: selectedModel,
    stream: generator(),
    getUsage: () => finalUsage,
  };
}
