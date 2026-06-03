type AvalaiMessageContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;

async function callAvalai({
  messages,
  model,
}: {
  messages: Array<{ role: "system" | "user" | "assistant"; content: AvalaiMessageContent }>;
  model?: string;
}) {
  const apiKey = process.env.AVALAI_API_KEY;
  const baseUrl = process.env.AVALAI_BASE_URL || "https://api.avalai.ir/v1";
  const selectedModel =
    model ||
    process.env.STUDENT_AI_MODEL ||
    process.env.AVALAI_DEFAULT_MODEL ||
    "gemini-2.5-flash-lite";

  if (!apiKey) {
    throw new Error("AVALAI_API_KEY تنظیم نشده است.");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      messages,
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "درخواست مدل دانش‌آموزی ناموفق بود.");
  }

  const data = JSON.parse(text);

  return {
    model: selectedModel,
    content: String(data?.choices?.[0]?.message?.content || ""),
    usage: data?.usage || null,
    requestId: response.headers.get("x-request-id"),
  };
}

export async function generateStudentAnswer(prompt: string) {
  return callAvalai({
    messages: [
      {
        role: "system",
        content:
          "تو یک معلم خصوصی فارسی‌زبان، دقیق و منبع‌محور هستی. پاسخ‌ها باید آموزشی، قابل فهم و همراه با منبع باشند.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
}

export async function extractQuestionFromStudentImage({
  imageDataUrl,
  helperText,
}: {
  imageDataUrl: string;
  helperText?: string;
}) {
  const result = await callAvalai({
    model: process.env.STUDENT_VISION_MODEL || process.env.STUDENT_AI_MODEL || "gemini-2.5-flash-lite",
    messages: [
      {
        role: "system",
        content:
          "تو OCR و تحلیل‌گر سوالات درسی فارسی هستی. فقط متن سوال، گزینه‌ها، داده‌ها و توضیحات لازم را دقیق استخراج کن. اگر تصویر واضح نیست، بگو واضح نیست.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `متن سوال داخل تصویر را دقیق استخراج کن. اگر کاربر توضیحی داده، آن را هم لحاظ کن.\nتوضیح کاربر: ${helperText || "ندارد"}`,
          },
          {
            type: "image_url",
            image_url: {
              url: imageDataUrl,
            },
          },
        ],
      },
    ],
  });

  return result.content.trim();
}
