import type { RastinoImageModel } from "@/lib/ai/image-model-catalog";

export type GeneratedAvalaiImage = {
  url: string;
  originalUrl?: string | null;
  model: string;
};

type GenerateAvalaiImageArgs = {
  model: RastinoImageModel;
  prompt: string;
  size: string;
};

function getAvalaiApiKey() {
  return process.env.AVALAI_API_KEY || "";
}

function getAvalaiBaseUrl() {
  return (process.env.AVALAI_BASE_URL || "https://api.avalai.ir/v1").replace(
    /\/+$/,
    ""
  );
}

export function hasAvalaiImageKey() {
  return Boolean(getAvalaiApiKey());
}

function toDataUrl(b64: string) {
  if (b64.startsWith("data:image/")) return b64;
  return `data:image/png;base64,${b64}`;
}

function findImageUrl(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:image/")) {
      return trimmed;
    }

    const urlMatch = trimmed.match(/https?:\/\/[^\s)"']+/i);
    if (urlMatch?.[0]) return urlMatch[0];

    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findImageUrl(item);
      if (found) return found;
    }

    return null;
  }

  if (typeof value === "object") {
    const item = value as Record<string, unknown>;

    const direct =
      item.url ||
      item.image_url ||
      item.imageUrl ||
      item.output_url ||
      item.outputUrl ||
      item.uri ||
      item.link;

    if (typeof direct === "string") {
      if (direct.startsWith("http") || direct.startsWith("data:image/")) {
        return direct;
      }

      const nested = findImageUrl(direct);
      if (nested) return nested;
    }

    const b64 =
      item.b64_json ||
      item.b64Json ||
      item.base64 ||
      item.image_base64 ||
      item.imageBase64;

    if (typeof b64 === "string" && b64.length > 100) {
      return toDataUrl(b64);
    }

    for (const key of [
      "data",
      "images",
      "image",
      "content",
      "message",
      "choices",
      "output",
      "result",
      "results",
    ]) {
      const found = findImageUrl(item[key]);
      if (found) return found;
    }
  }

  return null;
}

function collectImages(value: unknown, model: string): GeneratedAvalaiImage[] {
  const images: GeneratedAvalaiImage[] = [];

  function walk(item: unknown) {
    if (!item) return;

    if (typeof item === "object" && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;

      const b64 =
        record.b64_json ||
        record.b64Json ||
        record.base64 ||
        record.image_base64 ||
        record.imageBase64;

      const url =
        record.url ||
        record.image_url ||
        record.imageUrl ||
        record.output_url ||
        record.outputUrl ||
        record.uri ||
        record.link;

      if (typeof b64 === "string" && b64.length > 100) {
        images.push({ url: toDataUrl(b64), originalUrl: null, model });
        return;
      }

      if (typeof url === "string") {
        const found = findImageUrl(url);
        if (found) {
          images.push({ url: found, originalUrl: found, model });
          return;
        }
      }
    }

    if (Array.isArray(item)) {
      item.forEach(walk);
      return;
    }

    if (typeof item === "object") {
      Object.values(item as Record<string, unknown>).forEach(walk);
    }
  }

  walk(value);

  const unique = new Map<string, GeneratedAvalaiImage>();
  for (const image of images) {
    if (!unique.has(image.url)) unique.set(image.url, image);
  }

  return [...unique.values()];
}

function hasPersianText(value: string) {
  return /[\u0600-\u06FF]/.test(value);
}

function getObjectRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function extractTextFromAvalaiChat(data: unknown) {
  const root = getObjectRecord(data);
  const choices = root?.choices;

  if (!Array.isArray(choices)) return "";

  const firstChoice = getObjectRecord(choices[0]);
  const message = getObjectRecord(firstChoice?.message);
  const content = message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        const record = getObjectRecord(part);
        const text = record?.text || record?.content;

        return typeof text === "string" ? text : "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

async function translateRastinoFastPrompt(prompt: string) {
  if (!hasPersianText(prompt)) {
    return prompt;
  }

  try {
    const translatorModel =
      process.env.AVALAI_IMAGE_TRANSLATOR_MODEL || "gemini-2.0-flash";

    const data = await callAvalai("/chat/completions", {
      model: translatorModel,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You rewrite Persian image generation prompts into clear natural English for an image model. Do not answer the prompt. Only return the final image prompt. Preserve any Persian text that must appear inside the image exactly as Persian. Do not translate brand names, slogans, quoted Persian text, or text after labels like متن، نوشته، تیتر، شعار. Keep RTL/Persian text in a separate 'Text to render exactly:' section when needed.",
        },
        {
          role: "user",
          content: `Rewrite this image prompt for an English image model:\n\n${prompt}`,
        },
      ],
    });

    const translated = extractTextFromAvalaiChat(data)
      .replace(/^```[a-z]*\n?/i, "")
      .replace(/```$/i, "")
      .trim();

    if (translated.length < 8) {
      return prompt;
    }

    console.log("[RASTINO FAST PROMPT TRANSLATED]", {
      originalLength: prompt.length,
      translatedLength: translated.length,
    });

    return translated;
  } catch (error) {
    console.warn("[RASTINO FAST PROMPT TRANSLATION FAILED]", error);
    return prompt;
  }
}

async function buildImagePrompt(prompt: string, modelId: string) {
  const adaptedPrompt =
    modelId === "z-image-turbo"
      ? await translateRastinoFastPrompt(prompt)
      : prompt;

  return `${adaptedPrompt}

Important rendering rules:
- Follow the prompt precisely.
- If Persian text is requested, render it exactly as provided.
- Do not translate, transliterate, reverse, or break Persian/RTL letters.
- Avoid broken text, extra fingers, deformed hands, low quality, watermark, and unreadable typography.`;
}

async function callAvalai(path: string, body: Record<string, unknown>) {
  const apiKey = getAvalaiApiKey();

  if (!apiKey) {
    throw new Error("AVALAI_API_KEY is not configured.");
  }

  const res = await fetch(`${getAvalaiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(
      data?.error?.message ||
        data?.message ||
        text ||
        `AvalAI request failed: ${res.status}`
    );
  }

  return data;
}

export async function generateAvalaiImage({
  model,
  prompt,
  size,
}: GenerateAvalaiImageArgs) {
  const finalPrompt = await buildImagePrompt(prompt, model.id);

  if (model.endpoint === "images") {
    const data = await callAvalai("/images/generations", {
      model: model.id,
      prompt: finalPrompt,
      n: 1,
      size,
      response_format: "url",
    });

    const images = collectImages(data, model.id);
    const first = images[0];

    if (!first) {
      throw new Error("AvalAI image endpoint returned no image.");
    }

    return {
      url: first.url,
      originalUrl: first.originalUrl || first.url,
      images,
      model: model.id,
      provider: "avalai",
      raw: data,
    };
  }

  const data = await callAvalai("/chat/completions", {
    model: model.id,
    messages: [
      {
        role: "user",
        content: finalPrompt,
      },
    ],
    modalities: ["text", "image"],
    response_format: { type: "image" },
  });

  const images = collectImages(data, model.id);
  const fallbackUrl = findImageUrl(data);
  const first = images[0] || {
    url: fallbackUrl || "",
    originalUrl: fallbackUrl,
    model: model.id,
  };

  if (!first.url) {
    throw new Error(
      "AvalAI chat image model returned no image. This model may need a different image-output schema."
    );
  }

  return {
    url: first.url,
    originalUrl: first.originalUrl || first.url,
    images: images.length > 0 ? images : [first],
    model: model.id,
    provider: "avalai",
    raw: data,
  };
}
