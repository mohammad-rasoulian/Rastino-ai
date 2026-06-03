import type { RastinoModelId, RastinoModelProvider, RastinoPlanTier } from "@/lib/ai/model-catalog";

export type ModelId = RastinoModelId;

export type ToneMode =
  | "adaptive-human"
  | "formal"
  | "friendly"
  | "playful"
  | "direct"
  | "teacher"
  | "expert";

export type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  model?: string | null;
  toneMode?: ToneMode;
  deepThinking?: boolean;
  files?: string[];
  systemPrompt?: string;
};

export type ChatProps = {
  activeChatId: string | null;
  onChatCreated: (chatId: string) => void;
  onChatUpdated: () => void;
};

export type ModelInfo = {
  id: ModelId;
  name: string;
  short: string;
  feature: string;
  provider: RastinoModelProvider;
  tier: RastinoPlanTier;
  creditCost: number;
};

export type ToneModeInfo = {
  id: ToneMode;
  label: string;
  short: string;
  description: string;
};
