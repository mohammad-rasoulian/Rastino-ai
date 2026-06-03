import type {
  AspectRatio,
  GeneratedImage,
  ImageBrandKit,
  ImageModelId,
  ImageQuality,
} from "./types";

type GenerateImageArgs = {
  prompt: string;
  negativePrompt: string;
  model: ImageModelId;
  aspectRatio: AspectRatio;
  style: string;
  quality: ImageQuality;
  imageCount?: number;
  brandKit?: ImageBrandKit;
  presetId?: string | null;
};

type GenerateImageResult = {
  imageUrl: string;
  images: GeneratedImage[];
  model?: string;
  provider?: string;
  creditCost?: number;
  originalUrl?: string | null;
};

type SaveImageChatArgs = {
  prompt: string;
  finalPrompt?: string;
  model: ImageModelId;
  style: string;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  images: GeneratedImage[];
  brandKit?: ImageBrandKit;
  presetId?: string | null;
  [key: string]: unknown;
};

export async function requestImageGeneration(
  args: GenerateImageArgs
): Promise<GenerateImageResult> {
  const response = await fetch("/api/images/generate", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.imageUrl) {
    throw new Error(data?.error || "Image generation failed");
  }

  const imageUrl = String(data.imageUrl);

  const images = Array.isArray(data.images)
    ? data.images.map((image: Record<string, unknown>) => ({
        ...image,
        url: String(image.url || imageUrl),
      }))
    : [
        {
          url: imageUrl,
          model: data.model ? String(data.model) : args.model,
        },
      ];

  return {
    imageUrl,
    images: images as GeneratedImage[],
    model: data.model ? String(data.model) : args.model,
    provider: data.provider ? String(data.provider) : undefined,
    creditCost:
      typeof data.creditCost === "number" ? data.creditCost : undefined,
    originalUrl:
      typeof data.originalUrl === "string" ? data.originalUrl : null,
  };
}

export async function saveGeneratedImagesAsChat(args: SaveImageChatArgs) {
  const response = await fetch("/api/images/save-chat", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Image chat save failed");
  }

  return data;
}

export async function fetchImageChatMessages(chatId: string) {
  const response = await fetch(`/api/chats/${chatId}/messages`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Image chat messages request failed");
  }

  return response.json();
}
