export type TextModelId = "chatgpt" | "grok" | "gemini" | "claude" | "deepseek";

export const FREE_DAILY_TEXT_MESSAGES = 10;

export const MODEL_CREDIT_COST: Record<TextModelId, number> = {
  deepseek: 2,
  gemini: 4,
  grok: 6,
  chatgpt: 8,
  claude: 10,
};

export function normalizeTextModel(model: unknown): TextModelId {
  if (
    model === "chatgpt" ||
    model === "grok" ||
    model === "gemini" ||
    model === "claude" ||
    model === "deepseek"
  ) {
    return model;
  }

  return "deepseek";
}

export function getTodayStart() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}
