import type { AspectRatio, ImageModelId, ImageQuality } from "./types";

export const IMAGE_MODEL_IDS: ImageModelId[] = [
  "z-image-turbo",
  "imagen-4.0-ultra-generate-001",
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image",
  "gpt-5.2",
];

export const ASPECT_RATIO_IDS: AspectRatio[] = [
  "1:1",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
];

export const IMAGE_QUALITY_IDS: ImageQuality[] = ["standard", "high", "ultra"];

export const DEFAULT_IMAGE_STYLE = "سینمایی";
export const DEFAULT_ASPECT_RATIO: AspectRatio = "1:1";
export const DEFAULT_IMAGE_QUALITY: ImageQuality = "high";
export const IMAGE_PAYLOAD_PREFIX = "__RASTINO_IMAGE__";
