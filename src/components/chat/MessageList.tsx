import type { RefObject } from "react";
import { MarkdownMessage } from "./MarkdownMessage";
import { ModelLogo } from "./ModelLogo";
import type { Message, ModelInfo } from "./types";

type ImageResultPayload = {
  type: "image_result";
  prompt: string;
  model: string;
  style: string;
  aspectRatio: string;
  quality: string;
  images: {
    url: string;
    prompt: string;
    model: string;
    style: string;
    aspectRatio: string;
    quality: string;
    createdAt: string;
  }[];
};

type MessageListProps = {
  messages: Message[];
  models: ModelInfo[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
};

function parseImageResult(content: string): ImageResultPayload | null {
  if (!content.startsWith("__RASTINO_IMAGE__")) return null;

  try {
    return JSON.parse(content.replace("__RASTINO_IMAGE__", ""));
  } catch {
    return null;
  }
}


function getImageFileName(url?: string) {
  if (!url) return "";

  const cleanUrl = url.split("?")[0];
  const parts = cleanUrl.split("/").filter(Boolean);

  return parts[parts.length - 1] || "";
}

function getDisplayImageUrl(url?: string) {
  if (!url) return "";

  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  if (url.startsWith("/generated/images/")) {
    const filename = getImageFileName(url);

    if (filename) {
      return `/api/generated-images/${encodeURIComponent(filename)}?v=${Date.now()}`;
    }
  }

  return `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
}


function ThinkingPlaceholder() {
  return (
    <div className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400 shadow-sm animate-pulse">
      <span>در حال فکر کردن</span>
      <span className="inline-flex w-5 items-center justify-start" aria-hidden="true">
        <span className="animate-bounce">.</span>
        <span className="animate-bounce [animation-delay:120ms]">.</span>
        <span className="animate-bounce [animation-delay:240ms]">.</span>
      </span>
    </div>
  );
}

export function MessageList({
  messages,
  models,
  isLoadingMessages,
  bottomRef,
}: MessageListProps) {
  return (
    <>
      {isLoadingMessages && (
        <div className="py-10 text-center text-sm r-muted">
          در حال بارگذاری تاریخچه...
        </div>
      )}

      {messages.map((message, index) => {
        const isUser = message.role === "user";
    const isAssistantThinking = message.role === "assistant" && !String(message.content || "").trim();
        const imageResult = parseImageResult(message.content);

        return (
          <div
            key={message.id || index}
            className={`flex ${isUser ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[86%] rounded-3xl px-5 py-4 leading-8 ${
                isUser ? "message-user" : "message-assistant"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs opacity-70">
                <span>{isUser ? "شما" : "راستینو"}</span>

                {message.model && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <ModelLogo model={message.model} />
                      <span>
                        {models.find((model) => model.id === message.model)?.name}
                      </span>
                    </span>
                  </>
                )}

                                {isAssistantThinking && <ThinkingPlaceholder />}
{message.deepThinking && (
                  <>
                    <span>•</span>
                    <span>Think</span>
                  </>
                )}

                {message.systemPrompt && (
                  <>
                    <span>•</span>
                    <span>رفتار سفارشی</span>
                  </>
                )}
              </div>

              {imageResult ? (
                <div>
                  <p className="mb-3 text-sm leading-7 r-muted">
                    تصویر ساخته‌شده برای:
                  </p>

                  <p className="mb-4 text-sm leading-7">
                    {imageResult.prompt}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {imageResult.images.map((image) => (
                      <div
                        key={image.url}
                        className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#111]"
                      >
                        <img
                          src={getDisplayImageUrl(image.url)}
                          alt={image.prompt}
                          className="aspect-square w-full bg-[#050505] object-cover"
                          loading="eager"
                          decoding="async"
                          onLoad={() =>
                            console.log("[CHAT IMAGE LOAD OK]", {
                              originalUrl: image.url,
                              displayUrl: getDisplayImageUrl(image.url),
                            })
                          }
                          onError={() =>
                            console.error("[CHAT IMAGE LOAD ERROR]", {
                              originalUrl: image.url,
                              displayUrl: getDisplayImageUrl(image.url),
                            })
                          }
                        />

                        <div className="p-3">
                          <div className="mb-2 flex flex-wrap gap-2 text-[11px] r-muted">
                            <span>{image.model}</span>
                            <span>•</span>
                            <span>{image.style}</span>
                            <span>•</span>
                            <span>{image.aspectRatio}</span>
                          </div>

                          <a
                            href={getDisplayImageUrl(image.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-zinc-100 underline underline-offset-4"
                          >
                            باز کردن تصویر
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {message.systemPrompt && isUser && (
                    <div className="mb-3 rounded-2xl bg-black/10 px-3 py-2 text-xs leading-6">
                      ⚙️ {message.systemPrompt}
                    </div>
                  )}

                  {message.content.length > 0 ? (
                    <MarkdownMessage content={message.content} />
                  ) : (
                    !isUser && <span className="streaming-cursor" />
                  )}

                  {message.files && message.files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.files.map((file) => (
                        <span
                          key={file}
                          className="rounded-xl bg-black/10 px-3 py-1 text-xs"
                        >
                          📎 {file}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </>
  );
}
