import type { ModelId, ModelInfo } from "./types";
import { ModelLogo } from "./ModelLogo";

type ChatHeaderProps = {
  currentChatId: string | null;
  selectedModel: ModelId;
  models: ModelInfo[];
  onModelChange?: (model: ModelId) => void;
};

export function ChatHeader({
  currentChatId,
  selectedModel,
  models,
}: ChatHeaderProps) {
  const activeModel = models.find((model) => model.id === selectedModel);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[#202020] px-5">
      <div className="min-w-0">
        <h2 className="text-sm font-black">راستینو</h2>
        <p className="text-xs r-muted">
          {currentChatId ? "مکالمه ذخیره‌شده" : "چت جدید"}
        </p>
      </div>

      <div className="hidden max-w-md items-center gap-2 rounded-2xl border border-[#242424] bg-[#111] px-4 py-2 text-left md:flex">
        {activeModel && <ModelLogo model={activeModel.id} size="md" />}

        <span className="shrink-0 text-xs font-black text-zinc-100">
          {activeModel?.name}
        </span>

        <span className="h-4 w-px bg-[#2a2a2a]" />

        <span className="truncate text-xs r-muted">
          {activeModel?.feature}
        </span>
      </div>
    </header>
  );
}
