import { promptIdeas } from "./image-data";
import { ImageStudioMark } from "./ImageStudioMark";

type ImageEmptyStateProps = {
  onPromptSelect: (prompt: string) => void;
};

export function ImageEmptyState({ onPromptSelect }: ImageEmptyStateProps) {
  return (
    <div className="flex min-h-[62vh] flex-col items-center justify-center text-center">
      <ImageStudioMark size="lg" />

      <div className="mt-6 inline-flex rounded-full border border-[#242424] bg-[#111] px-4 py-2 text-xs font-black text-zinc-300">
        Image Studio Pro
      </div>

      <h1 className="mt-5 text-3xl font-black leading-[1.35] md:text-4xl">
        چه تصویری بسازیم؟
      </h1>

      <p className="mt-4 max-w-xl text-sm leading-8 r-muted">
        ایده‌ات را بنویس، preset انتخاب کن، برندکیت بده و خروجی حرفه‌ای بگیر.
      </p>

      <div className="mt-8 grid w-full max-w-4xl gap-3 md:grid-cols-2">
        {promptIdeas.map((idea) => (
          <button
            key={idea}
            onClick={() => onPromptSelect(idea)}
            className="image-idea-card"
          >
            {idea}
          </button>
        ))}
      </div>
    </div>
  );
}
