"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultImageModel,
  imageBoosts,
  imageModels,
  imagePresets,
  type ImageBoostId,
  type ImagePresetId,
} from "./image-data";
import {
  DEFAULT_ASPECT_RATIO,
  DEFAULT_IMAGE_QUALITY,
  DEFAULT_IMAGE_STYLE,
} from "./image-constants";
import {
  fetchImageChatMessages,
  requestImageGeneration,
  saveGeneratedImagesAsChat,
} from "./image-api";
import type {
  AspectRatio,
  GeneratedImage,
  ImageBrandKit,
  ImageMagicAction,
  ImageModelId,
  ImageQuality,
} from "./types";
import {
  buildFinalImagePrompt,
  buildImprovedPrompt,
  createGeneratedImage,
  normalizeSavedImages,
  normalizeSavedPayloadSettings,
  parseImagePayload,
} from "./image-utils";

type UseImageStudioArgs = {
  activeImageChatId?: string | null;
  onImageChatSaved?: () => void;
};

type MessageWithContent = {
  content?: string;
};

const defaultBrandKit: ImageBrandKit = {
  brandName: "",
  brandTone: "",
  mainColor: "",
  slogan: "",
};

function buildMagicPrompt(image: GeneratedImage, action: ImageMagicAction) {
  if (action === "similar") {
    return `${image.prompt}

یک نسخه مشابه اما حرفه‌ای‌تر از همین ایده بساز. ترکیب‌بندی را کمی متفاوت کن، کیفیت بصری را بالاتر ببر و خروجی را آماده استفاده واقعی کن.`;
  }

  if (action === "website-banner") {
    return `${image.prompt}

این ایده را به یک بنر سایت حرفه‌ای تبدیل کن. تصویر افقی باشد، فضای خالی کافی برای تیتر داشته باشد، ظاهر مدرن و قابل اعتماد داشته باشد و مناسب هدر صفحه اصلی یک وب‌سایت باشد.`;
  }

  if (action === "story") {
    return `${image.prompt}

این ایده را به یک استوری عمودی جذاب تبدیل کن. سوژه مرکزی، کنتراست بالا، فضای مناسب برای متن کوتاه و ترکیب‌بندی مناسب موبایل داشته باشد.`;
  }

  if (action === "social-post") {
    return `${image.prompt}

این ایده را به یک پست مربعی شبکه اجتماعی تبدیل کن. متن یا پیام اصلی باید واضح باشد، ترکیب‌بندی متعادل باشد و در نگاه اول توجه کاربر را جلب کند.`;
  }

  if (action === "improve") {
    return buildImprovedPrompt(image.prompt);
  }

  return image.prompt;
}

export function useImageStudio({
  activeImageChatId,
  onImageChatSaved,
}: UseImageStudioArgs) {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedModel, setSelectedModel] =
    useState<ImageModelId>(defaultImageModel);
  const [style, setStyle] = useState(DEFAULT_IMAGE_STYLE);
  const [aspectRatio, setAspectRatio] =
    useState<AspectRatio>(DEFAULT_ASPECT_RATIO);
  const [quality, setQuality] = useState<ImageQuality>(DEFAULT_IMAGE_QUALITY);
  const [imageCount, setImageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const [selectedPresetId, setSelectedPresetId] =
    useState<ImagePresetId | null>(null);
  const [selectedBoostIds, setSelectedBoostIds] = useState<ImageBoostId[]>([]);
  const [brandKit, setBrandKit] = useState<ImageBrandKit>(defaultBrandKit);
  const [useBrandKit, setUseBrandKit] = useState(false);

  const activeModel = imageModels.find((model) => model.id === selectedModel);
  const activePreset = imagePresets.find(
    (preset) => preset.id === selectedPresetId
  );

  const boostPrompt = useMemo(
    () =>
      selectedBoostIds
        .map((boostId) => imageBoosts.find((boost) => boost.id === boostId))
        .filter(Boolean)
        .map((boost) => boost?.promptAddon)
        .filter(Boolean)
        .join("\n"),
    [selectedBoostIds]
  );

  const finalPrompt = useMemo(
    () =>
      buildFinalImagePrompt({
        prompt,
        style,
        quality,
        aspectRatio,
        brandKit: useBrandKit ? brandKit : undefined,
        presetHint: [activePreset?.promptHint, boostPrompt]
          .filter(Boolean)
          .join("\n"),
      }),
    [
      prompt,
      style,
      quality,
      aspectRatio,
      brandKit,
      useBrandKit,
      activePreset,
      boostPrompt,
    ]
  );

  useEffect(() => {
    let cancelled = false;

    async function syncImageChat() {
      if (!activeImageChatId) {
        setImages([]);
        setPrompt("");
        setSelectedPresetId(null);
        setSelectedBoostIds([]);
        return;
      }

      try {
        const data = await fetchImageChatMessages(activeImageChatId);

        if (cancelled) return;

        const imageMessage = (data.messages || []).find(
          (message: MessageWithContent) =>
            typeof message.content === "string" &&
            message.content.startsWith("__RASTINO_IMAGE__")
        );

        if (!imageMessage?.content) return;

        const payload = parseImagePayload(imageMessage.content);

        if (!payload) return;

        const settings = normalizeSavedPayloadSettings(payload);

        setPrompt(settings.prompt);
        setStyle(settings.style);
        setSelectedModel(settings.model);
        setAspectRatio(settings.aspectRatio);
        setQuality(settings.quality);
        setImages(normalizeSavedImages(payload, activeImageChatId));

        if (settings.brandKit) {
          setBrandKit(settings.brandKit);
          setUseBrandKit(true);
        } else {
          setBrandKit(defaultBrandKit);
          setUseBrandKit(false);
        }

        if (settings.presetId) {
          setSelectedPresetId(settings.presetId as ImagePresetId);
        } else {
          setSelectedPresetId(null);
        }

        setSelectedBoostIds([]);
      } catch (error) {
        console.error("[LOAD SAVED IMAGE CHAT ERROR]", error);
      }
    }

    syncImageChat();

    return () => {
      cancelled = true;
    };
  }, [activeImageChatId]);

  function updateBrandKit<K extends keyof ImageBrandKit>(
    key: K,
    value: ImageBrandKit[K]
  ) {
    setBrandKit((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function applyPreset(presetId: ImagePresetId) {
    const preset = imagePresets.find((item) => item.id === presetId);

    if (!preset) return;

    setSelectedPresetId(preset.id);
    setAspectRatio(preset.aspectRatio);
    setStyle(preset.style);
    setQuality(preset.quality);
  }

  function clearPreset() {
    setSelectedPresetId(null);
  }

  function toggleBoost(boostId: ImageBoostId) {
    setSelectedBoostIds((prev) =>
      prev.includes(boostId)
        ? prev.filter((item) => item !== boostId)
        : [...prev, boostId]
    );
  }

  function clearBoosts() {
    setSelectedBoostIds([]);
  }

  function improvePrompt() {
    setPrompt((currentPrompt) => buildImprovedPrompt(currentPrompt));
  }

  function architectPrompt() {
    const base = prompt.trim() || "یک تصویر حرفه‌ای برای برند یا ایده شما";
    const presetText = activePreset ? `هدف تصویر: ${activePreset.title}` : "";

    const hasBrandInfo =
      brandKit.brandName.trim() ||
      brandKit.brandTone.trim() ||
      brandKit.mainColor.trim() ||
      brandKit.slogan.trim();

    const brandText =
      useBrandKit && hasBrandInfo
        ? `برند: ${brandKit.brandName || "نامشخص"}، لحن: ${
            brandKit.brandTone || "مدرن"
          }، رنگ: ${brandKit.mainColor || "هماهنگ با تصویر"}، پیام: ${
            brandKit.slogan || "ندارد"
          }`
        : "";

    const boostText = boostPrompt ? `تقویت‌های خلاقانه:\n${boostPrompt}` : "";

    setPrompt(`${base}

${presetText}
${brandText}
${boostText}

این ایده را به یک تصویر حرفه‌ای تبدیل کن: سوژه اصلی واضح باشد، ترکیب‌بندی تمیز و چشم‌نواز داشته باشد، نورپردازی حرفه‌ای باشد، خروجی برای استفاده واقعی در وب‌سایت یا شبکه‌های اجتماعی آماده باشد، و حس بصری آن مدرن، قابل اعتماد و باکیفیت باشد.`);
  }

  function runMagicAction(image: GeneratedImage, action: ImageMagicAction) {
    setPrompt(buildMagicPrompt(image, action));

    if (action === "website-banner") {
      setAspectRatio("16:9");
      setStyle("مینیمال");
      setQuality("high");
      setSelectedPresetId("website-banner");
    }

    if (action === "story") {
      setAspectRatio("9:16");
      setStyle("سینمایی");
      setQuality("high");
      setSelectedPresetId("story");
    }

    if (action === "social-post") {
      setAspectRatio("1:1");
      setStyle("پوستر تبلیغاتی");
      setQuality("high");
      setSelectedPresetId("social-post");
    }

    if (action === "similar" || action === "improve") {
      setQuality("ultra");
    }
  }

  async function generateImage() {
    const cleanPrompt = prompt.trim();

    if (!cleanPrompt || isLoading) return;

    const pendingId = `pending-${crypto.randomUUID()}`;

    const pendingImage: GeneratedImage = {
      id: pendingId,
      prompt: finalPrompt || cleanPrompt,
      model: selectedModel,
      style,
      aspectRatio,
      quality,
      createdAt: new Date().toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "loading",
    };

    setImages((prev) => [pendingImage, ...prev]);
    setIsLoading(true);

    try {
      const result = await requestImageGeneration({
        prompt: finalPrompt || cleanPrompt,
        model: selectedModel,
        style,
        aspectRatio,
        quality,
        imageCount,
        negativePrompt,
        brandKit: useBrandKit ? brandKit : undefined,
        presetId: selectedPresetId || undefined,
      });

      const generatedImages = (result.images || [
        {
          url: result.imageUrl,
          model: result.model || selectedModel,
        },
      ])
        .filter(
          (image): image is GeneratedImage & { url: string } =>
            Boolean(image.url)
        )
        .map((image) =>
          createGeneratedImage({
            prompt: finalPrompt || cleanPrompt,
            model: image.model || selectedModel,
            style,
            aspectRatio,
            quality,
            url: image.url,
          })
        );

      if (generatedImages.length === 0) {
        throw new Error("هیچ تصویری از سرویس دریافت نشد.");
      }

      setImages((prev) => [
        ...generatedImages,
        ...prev.filter((image) => image.id !== pendingId),
      ]);

      await saveGeneratedImagesAsChat({
        prompt: cleanPrompt,
        finalPrompt: finalPrompt || cleanPrompt,
        model: selectedModel,
        style,
        aspectRatio,
        quality,
        images: generatedImages,
        brandKit: useBrandKit ? brandKit : undefined,
        presetId: selectedPresetId || undefined,
      });

      onImageChatSaved?.();
    } catch (error) {
      console.error("[IMAGE GENERATE ERROR]", error);

      setImages((prev) =>
        prev.map((image) =>
          image.id === pendingId
            ? {
                ...image,
                status: "error",
                errorMessage:
                  error instanceof Error
                    ? error.message
                    : "تولید تصویر ناموفق بود.",
              }
            : image
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  return {
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    selectedModel,
    setSelectedModel,
    style,
    setStyle,
    aspectRatio,
    setAspectRatio,
    quality,
    setQuality,
    imageCount,
    setImageCount,
    isLoading,
    images,
    activeModel,
    finalPrompt,

    selectedPresetId,
    setSelectedPresetId,
    activePreset,
    applyPreset,
    clearPreset,

    selectedBoostIds,
    toggleBoost,
    clearBoosts,

    brandKit,
    setBrandKit,
    updateBrandKit,
    useBrandKit,
    setUseBrandKit,

    improvePrompt,
    architectPrompt,
    runMagicAction,
    generateImage,
  };
}
