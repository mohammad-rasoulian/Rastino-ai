import type { AiMessageContent } from "./gapgpt";

type AvalaiMessage = {
  role: "system" | "user" | "assistant";
  content: AiMessageContent;
};

type StreamAvalaiArgs = {
  messages: AvalaiMessage[];
  model?: string;
  signal?: AbortSignal;
  maxTokens?: number;
  temperature?: number;
};

export type AvalaiUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTokens: number;
  costUsd: number;
  requestId?: string;
};

type AvalaiStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    cost?: number;
  };
};

function normalizeUsage(usage?: AvalaiStreamChunk["usage"], requestId?: string): AvalaiUsage {
  return {
    promptTokens: usage?.prompt_tokens ?? usage?.promptTokens ?? 0,
    completionTokens: usage?.completion_tokens ?? usage?.completionTokens ?? 0,
    totalTokens: usage?.total_tokens ?? usage?.totalTokens ?? 0,
    reasoningTokens: 0,
    costUsd: usage?.cost ?? 0,
    requestId,
  };
}

function safeJsonParse(value: string): AvalaiStreamChunk | null {
  try {
    return JSON.parse(value) as AvalaiStreamChunk;
  } catch {
    return null;
  }
}

export async function streamAvalai({
  messages,
  model,
  signal,
  maxTokens,
  temperature = 0.7,
}: StreamAvalaiArgs) {
  const apiKey = process.env.AVALAI_API_KEY;
  const baseUrl = process.env.AVALAI_BASE_URL || "https://api.avalai.ir/v1";
  const selectedModel =
    model || process.env.AVALAI_DEFAULT_MODEL || "gemini-2.5-flash-lite";

  if (!apiKey) {
    throw new Error("AVALAI_API_KEY is not configured.");
  }

  let usage: AvalaiUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    reasoningTokens: 0,
    costUsd: 0,
  };

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      stream: true,
      temperature,
      max_tokens: maxTokens,
      stream_options: {
        include_usage: true,
      },
    }),
  });

  const requestId = response.headers.get("x-request-id") || undefined;
  usage.requestId = requestId;

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `[AVALAI ERROR] ${response.status} ${response.statusText} ${text}`.trim(),
    );
  }

  async function* stream() {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";

      for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line || !line.startsWith("data:")) continue;

        const data = line.replace(/^data:\s*/, "");

        if (data === "[DONE]") return;

        const parsed = safeJsonParse(data);
        if (!parsed) continue;

        if (parsed.usage) {
          usage = normalizeUsage(parsed.usage, requestId);
        }

        const content =
          parsed.choices?.[0]?.delta?.content ||
          parsed.choices?.[0]?.message?.content ||
          "";

        if (content) {
          yield content;
        }
      }
    }
  }

  return {
    provider: "avalai" as const,
    model: selectedModel,
    requestId,
    stream: stream(),
    getUsage: () => usage,
  };
}
