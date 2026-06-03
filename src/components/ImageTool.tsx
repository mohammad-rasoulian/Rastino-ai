"use client";

import { ImageControlPanel } from "@/components/image/ImageControlPanel";
import { ImageEmptyState } from "@/components/image/ImageEmptyState";
import { ImageGallery } from "@/components/image/ImageGallery";
import { ImageHeader } from "@/components/image/ImageHeader";
import { useImageStudio } from "@/components/image/useImageStudio";
import type { ImageToolProps } from "@/components/image/types";

export function ImageTool({
  activeImageChatId,
  onImageChatSaved,
}: ImageToolProps) {
  const studio = useImageStudio({
    activeImageChatId,
    onImageChatSaved,
  });

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem] border border-[#181818] bg-[#080808]">
      <section className="flex min-w-0 flex-1 flex-col">
        <ImageHeader
          activeModel={studio.activeModel}
          aspectRatio={studio.aspectRatio}
        />

        <div className="flex-1 overflow-y-auto p-5">
          {studio.images.length === 0 ? (
            <ImageEmptyState onPromptSelect={studio.setPrompt} />
          ) : (
            <ImageGallery
              images={studio.images}
              onReusePrompt={studio.setPrompt}
              onMagicAction={studio.runMagicAction}
            />
          )}
        </div>
      </section>

      <ImageControlPanel
        prompt={studio.prompt}
        setPrompt={studio.setPrompt}
        negativePrompt={studio.negativePrompt}
        setNegativePrompt={studio.setNegativePrompt}
        selectedModel={studio.selectedModel}
        setSelectedModel={studio.setSelectedModel}
        style={studio.style}
        setStyle={studio.setStyle}
        aspectRatio={studio.aspectRatio}
        setAspectRatio={studio.setAspectRatio}
        quality={studio.quality}
        setQuality={studio.setQuality}
        imageCount={studio.imageCount}
        setImageCount={studio.setImageCount}
        activeModel={studio.activeModel}
        isLoading={studio.isLoading}
        onImprovePrompt={studio.improvePrompt}
        onArchitectPrompt={studio.architectPrompt}
        onGenerateImage={studio.generateImage}
        selectedPresetId={studio.selectedPresetId}
        onApplyPreset={studio.applyPreset}
        onClearPreset={studio.clearPreset}
        selectedBoostIds={studio.selectedBoostIds}
        onToggleBoost={studio.toggleBoost}
        onClearBoosts={studio.clearBoosts}
        brandKit={studio.brandKit}
        useBrandKit={studio.useBrandKit}
        setUseBrandKit={studio.setUseBrandKit}
        updateBrandKit={studio.updateBrandKit}
      />
    </div>
  );
}
