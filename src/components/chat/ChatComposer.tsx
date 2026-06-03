import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type KeyboardEvent,
  type RefObject,
  type SetStateAction,
} from "react";
import type { RastinoPlanTier } from "@/lib/ai/model-catalog";
import type { ModelId, ModelInfo, ToneMode } from "./types";
import { presets, toneModes } from "./chat-data";
import { ModelLogo } from "./ModelLogo";

type ChatComposerProps = {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  selectedModel: ModelId;
  setSelectedModel: Dispatch<SetStateAction<ModelId>>;
  toneMode: ToneMode;
  setToneMode: Dispatch<SetStateAction<ToneMode>>;
  deepThinking: boolean;
  setDeepThinking: Dispatch<SetStateAction<boolean>>;
  systemPrompt: string;
  setSystemPrompt: Dispatch<SetStateAction<string>>;
  showPromptBox: boolean;
  setShowPromptBox: Dispatch<SetStateAction<boolean>>;
  files: File[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  models: ModelInfo[];
  userPlan: RastinoPlanTier;
  isAdmin: boolean;
  onAdminPlanChange: (plan: RastinoPlanTier) => void;
  isLoading: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onSendMessage: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
};

type ModelPickerProps = {
  models: ModelInfo[];
  selectedModel: ModelId;
  setSelectedModel: Dispatch<SetStateAction<ModelId>>;
};

const planLabels: Record<RastinoPlanTier, string> = {
  free: "رایگان",
  plus: "پلاس",
  pro: "پرو",
};

function ModelPicker({
  models,
  selectedModel,
  setSelectedModel,
}: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const activeModel =
    models.find((model) => model.id === selectedModel) || models[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!pickerRef.current) return;

      if (!pickerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeModel) {
    return null;
  }

  return (
    <div ref={pickerRef} className="relative">
      {open && (
        <div className="absolute bottom-full right-0 z-50 mb-2 w-64 overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#101010] shadow-2xl">
          <div className="max-h-72 overflow-y-auto p-2">
            {models.map((model) => {
              const active = model.id === selectedModel;

              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setSelectedModel(model.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-right transition ${
                    active
                      ? "bg-white/[0.08] text-zinc-100"
                      : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
                  }`}
                >
                  <ModelLogo model={model.id} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black">
                          {model.name}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] opacity-60">
                          {model.short} • {model.creditCost} اعتبار
                        </p>
                      </div>

                      {active && (
                        <span className="shrink-0 text-xs text-emerald-300">
                          ✓
                        </span>
                      )}
                    </div>

                    <p
                      className="mt-1 truncate text-[10px] font-medium text-zinc-600"
                      dir="ltr"
                    >
                      {model.id}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-black transition ${
          open ? "r-pill-active" : "r-pill"
        }`}
        title="انتخاب مدل"
      >
        <ModelLogo model={activeModel.id} />
        <span className="max-w-32 truncate" dir="ltr">{activeModel.name}</span>
        <span className="text-[10px] opacity-70">⌃</span>
      </button>
    </div>
  );
}

export function ChatComposer({
  input,
  setInput,
  selectedModel,
  setSelectedModel,
  toneMode,
  setToneMode,
  deepThinking,
  setDeepThinking,
  systemPrompt,
  setSystemPrompt,
  showPromptBox,
  setShowPromptBox,
  files,
  fileInputRef,
  models,
  userPlan,
  isAdmin,
  onAdminPlanChange,
  isLoading,
  onFileChange,
  onRemoveFile,
  onSendMessage,
  onKeyDown,
}: ChatComposerProps) {
  const activeTone = toneModes.find((item) => item.id === toneMode);

  return (
    <footer className="shrink-0 px-4 pb-5">
      <div className="mx-auto max-w-4xl">
        {showPromptBox && (
          <div className="mb-3 rounded-3xl border border-[#242424] bg-[#101010] p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black">رفتار هوش مصنوعی</p>
                <p className="text-xs r-muted">
                  لحن پاسخ را انتخاب کن یا پرامپت اختصاصی بنویس.
                </p>
              </div>

              {(systemPrompt || toneMode !== "adaptive-human") && (
                <button
                  type="button"
                  onClick={() => {
                    setSystemPrompt("");
                    setToneMode("adaptive-human");
                  }}
                  className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-300"
                >
                  بازنشانی
                </button>
              )}
            </div>

            <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {toneModes.map((tone) => {
                const active = toneMode === tone.id;

                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setToneMode(tone.id)}
                    className={`rounded-2xl px-3 py-3 text-right ${
                      active ? "r-pill-active" : "r-pill"
                    }`}
                  >
                    <span className="block text-xs font-black">
                      {tone.label}
                    </span>
                    <span className="mt-1 block text-[11px] leading-5 opacity-70">
                      {tone.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSystemPrompt(preset)}
                  className={`rounded-xl px-3 py-2 text-xs ${
                    systemPrompt === preset ? "r-active" : "r-pill"
                  }`}
                >
                  {preset.slice(0, 24)}...
                </button>
              ))}
            </div>

            <textarea
              value={systemPrompt}
              onChange={(event) => setSystemPrompt(event.target.value)}
              placeholder="مثلاً: دقیق، علمی، بدون حاشیه و مرحله‌به‌مرحله جواب بده..."
              rows={3}
              className="r-input w-full resize-none rounded-2xl p-3 text-sm leading-7 outline-none"
            />

            {activeTone && (
              <p className="mt-2 text-xs leading-6 r-muted">
                حالت فعلی: {activeTone.label} — {activeTone.description}
              </p>
            )}
          </div>
        )}

        {files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <button
                key={`${file.name}-${index}`}
                type="button"
                onClick={() => onRemoveFile(index)}
                className="r-pill rounded-xl px-3 py-2 text-xs"
              >
                📎 {file.name} ×
              </button>
            ))}
          </div>
        )}

        <div className="r-input overflow-visible rounded-[1.75rem] p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#242424] pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <ModelPicker
                models={models}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
              />

              {isAdmin && (
                <div className="flex items-center gap-1">
                  {(["free", "plus", "pro"] as RastinoPlanTier[]).map(
                    (plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => onAdminPlanChange(plan)}
                        className={`h-9 rounded-xl px-3 text-[11px] font-black ${
                          userPlan === plan ? "r-pill-active" : "r-pill"
                        }`}
                        title={`تست پلن ${planLabels[plan]}`}
                      >
                        {planLabels[plan]}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDeepThinking((prev) => !prev)}
                className={`h-9 rounded-xl px-3 text-xs font-bold ${
                  deepThinking ? "r-pill-active" : "r-pill"
                }`}
              >
                Think
              </button>

              <button
                type="button"
                onClick={() => setShowPromptBox((prev) => !prev)}
                className={`h-9 rounded-xl px-3 text-xs font-bold ${
                  showPromptBox || systemPrompt || toneMode !== "adaptive-human"
                    ? "r-pill-active"
                    : "r-pill"
                }`}
              >
                رفتار
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="r-pill h-9 rounded-xl px-3 text-xs font-bold"
              >
                فایل
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={onFileChange}
              />
            </div>
          </div>

          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="پیام خود را بنویس..."
              rows={2}
              className="max-h-44 min-h-14 flex-1 resize-none bg-transparent px-2 py-3 leading-7 outline-none placeholder:text-zinc-600"
            />

            <button
              type="button"
              onClick={onSendMessage}
              disabled={isLoading || (!input.trim() && files.length === 0)}
              className="r-primary h-12 w-12 rounded-2xl text-lg font-black"
            >
              ↑
            </button>
          </div>
        </div>

        <p className="mt-3 text-center text-xs r-muted">
          راستینو ممکن است اشتباه کند؛ پاسخ‌های مهم را بررسی کنید.
        </p>
      </div>
    </footer>
  );
}
