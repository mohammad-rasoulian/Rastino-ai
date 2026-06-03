export type AiMessageContent =
  | string
  | (
      | {
          type: "text";
          text: string;
        }
      | {
          type: "image_url";
          image_url: {
            url: string;
          };
        }
    )[];

type GapGptMessage = {
  role: "system" | "user" | "assistant";
  content: AiMessageContent;
};

type StreamGapGptArgs = {
  messages: GapGptMessage[];
  model?: string;
  signal?: AbortSignal;
};

type GapGptStreamChunk = {
  choices?: {
    delta?: {
      content?: string;
    };
  }[];
};

function getGapGptBaseUrl() {
  return process.env.GAPGPT_BASE_URL || "https://api.gapgpt.app/v1";
}

function getGapGptHeaders() {
  const apiKey = process.env.GAPGPT_API_KEY;

  if (!apiKey) {
    throw new Error("GAPGPT_API_KEY is not set");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

function parseSseLine(line: string) {
  if (!line.startsWith("data:")) return null;

  const data = line.replace(/^data:\s*/, "").trim();

  if (!data || data === "[DONE]") return null;

  try {
    return JSON.parse(data) as GapGptStreamChunk;
  } catch {
    return null;
  }
}

export function hasGapGptKey() {
  const mode = process.env.GAPGPT_MODE || "mock";

  if (mode !== "real") {
    return false;
  }

  return Boolean(process.env.GAPGPT_API_KEY?.trim());
}

export async function streamGapGptText({
  messages,
  model,
  signal,
}: StreamGapGptArgs) {
  const selectedModel = model || process.env.GAPGPT_DEFAULT_MODEL || "gpt-4o";
  const baseUrl = getGapGptBaseUrl().replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: getGapGptHeaders(),
    signal,
    body: JSON.stringify({
      model: selectedModel,
      messages,
      stream: true,
      temperature: 0.7,
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "GapGPT request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  async function* generator() {
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const parsed = parseSseLine(line);
        const token = parsed?.choices?.[0]?.delta?.content;

        if (token) {
          yield token;
        }
      }
    }
  }

  return {
    model: selectedModel,
    provider: "gapgpt",
    stream: generator(),
  };
}
