export type ImageModelId =
  | "z-image-turbo"
  | "imagen-4.0-ultra-generate-001"
  | "gemini-2.5-flash-image"
  | "gemini-3.1-flash-image"
  | "gpt-5.2";

export type ImagePlanTier = "free" | "plus" | "pro";

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
export type ImageQuality = "standard" | "high" | "ultra";

export type GeneratedImageStatus = "loading" | "ready" | "error";

export type GeneratedImage = {
  id: string;
  prompt: string;
  model: ImageModelId;
  style: string;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  url?: string;
  createdAt: string;
  status?: GeneratedImageStatus;
  errorMessage?: string;
};

export type ImageModelInfo = {
  id: ImageModelId;
  name: string;
  titleFa: string;
  badge: string;
  description: string;
  tier: ImagePlanTier;
  creditCost: number;
  estimatedTime: string;
};

export type ImageQualityInfo = {
  id: ImageQuality;
  label: string;
  hint: string;
};

export type ImageBrandKit = {
  brandName: string;
  brandTone: string;
  mainColor: string;
  slogan: string;
};

export type ImageMagicAction =
  | "reuse"
  | "similar"
  | "website-banner"
  | "story"
  | "social-post"
  | "improve";

export type SavedImagePayload = {
  type: "image_result";
  prompt: string;
  finalPrompt?: string;
  model: string;
  style: string;
  aspectRatio: string;
  quality: string;
  brandKit?: ImageBrandKit;
  presetId?: string;
  images: {
    id?: string;
    url: string;
    prompt: string;
    model: string;
    style: string;
    aspectRatio: string;
    quality: string;
    createdAt: string;
  }[];
};

export type ImageToolProps = {
  activeImageChatId?: string | null;
  onImageChatSaved?: () => void;
};
