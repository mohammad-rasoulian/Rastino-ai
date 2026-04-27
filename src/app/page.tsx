"use client";

import { FormEvent, KeyboardEvent, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
};

type AiModel = {
  id: string;
  name: string;
  provider: string;
  badge: string;
  description: string;
  creditCost: number;
};

const models: AiModel[] = [
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    badge: "سریع",
    description: "مناسب برای چت عمومی، تولید محتوا و پاسخ‌های سریع",
    creditCost: 1,
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek Chat",
    provider: "DeepSeek",
    badge: "اقتصادی",
    description: "مناسب برای برنامه‌نویسی، تحلیل متن و استفاده روزمره",
    creditCost: 1,
  },
  {
    id: "google/gemini-flash-1.5",
    name: "Gemini Flash",
    provider: "Google",
    badge: "چابک",
    description: "مناسب برای پاسخ‌های سریع و کارهای سبک",
    creditCost: 1,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    badge: "حرفه‌ای",
    description: "مناسب برای تحلیل عمیق، نوشتن حرفه‌ای و کدنویسی",
    creditCost: 3,
  },
];

const suggestions = [
  "برای راستینو یک شعار کوتاه پیشنهاد بده",
  "یک متن تبلیغاتی برای کاربران ایرانی بنویس",
  "ایده‌های درآمدزایی این پلتفرم رو لیست کن",
  "یک roadmap ساده برای MVP راستینو بده",
];

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createWelcomeMessage(): Message {
  return {
    id: createId(),
    role: "assistant",
    content:
      "سلام! من راستینو هستم؛ دستیار هوش مصنوعی چندمدلی. فعلاً در حالت پروتوتایپ هستیم و پاسخ‌ها از API داخلی پروژه برمی‌گردند.",
    createdAt: new Date(),
  };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([createWelcomeMessage()]);
  const [input, setInput] = useState("");
  const [selectedModelId, setSelectedModelId] = useState(models[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedModel = useMemo(() => {
    return models.find((model) => model.id === selectedModelId) || models[0];
  }, [selectedModelId]);

  const userMessageCount = messages.filter(
    (message) => message.role === "user"
  ).length;

  function startNewChat() {
    setMessages([createWelcomeMessage()]);
    setInput("");
    textareaRef.current?.focus();
  }

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();

    if (!content || isLoading) return;

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content:
          data.content ||
          data.error ||
          "متأسفم، پاسخ معتبری از سرور دریافت نشد.",
        createdAt: new Date(),
      };

      setMessages([...nextMessages, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: createId(),
        role: "assistant",
        content:
          "خطا در ارتباط با سرور داخلی راستینو. لطفاً مطمئن شو سرور Next.js روشن است.",
        createdAt: new Date(),
      };

      setMessages([...nextMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <main dir="rtl" className="min-h-screen text-zinc-100">
      <div className="flex min-h-screen">
        <aside className="glass-panel m-4 hidden w-80 shrink-0 rounded-[2rem] p-5 lg:flex lg:flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="brand-gradient float-soft flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black text-white shadow-lg shadow-blue-600/20">
                ر
              </div>

              <div>
                <h1 className="text-xl font-black tracking-tight">راستینو</h1>
                <p className="text-xs text-zinc-400">
                  دسترسی یکپارچه به مدل‌های هوش مصنوعی
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={startNewChat}
            className="glow-button brand-gradient mb-5 rounded-2xl px-4 py-3 text-sm font-bold text-white transition hover:scale-[1.01]"
          >
            + چت جدید
          </button>

          <div className="space-y-3">
            <p className="text-xs font-bold text-zinc-400">انتخاب مدل</p>

            {models.map((model) => {
              const isActive = model.id === selectedModelId;

              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedModelId(model.id)}
                  className={`w-full rounded-2xl p-4 text-right transition ${
                    isActive
                      ? "glass-card border-blue-400/70 bg-blue-500/15 shadow-blue-500/10"
                      : "glass-card border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="relative z-10 mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">{model.name}</p>
                      <p className="text-xs text-zinc-500">{model.provider}</p>
                    </div>

                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-zinc-300">
                      {model.badge}
                    </span>
                  </div>

                  <p className="relative z-10 text-xs leading-6 text-zinc-400">
                    {model.description}
                  </p>

                  <p className="relative z-10 mt-3 text-xs text-zinc-500">
                    هزینه آزمایشی: {model.creditCost} اعتبار
                  </p>
                </button>
              );
            })}
          </div>

          <div className="glass-card mt-auto rounded-2xl p-4">
            <p className="relative z-10 text-sm font-bold">وضعیت پروتوتایپ</p>
            <div className="relative z-10 mt-3 space-y-2 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>اتصال Frontend</span>
                <span className="text-emerald-400">فعال</span>
              </div>
              <div className="flex justify-between">
                <span>API داخلی</span>
                <span className="text-emerald-400">فعال</span>
              </div>
              <div className="flex justify-between">
                <span>OpenRouter</span>
                <span className="text-amber-400">بعداً</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="px-4 py-4 md:px-8">
            <div className="glass-panel mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-[2rem] px-5 py-4">
              <div>
                <p className="text-xs text-zinc-500">پروتوتایپ راستینو</p>
                <h2 className="text-gradient text-lg font-black md:text-2xl">
                  چت هوشمند چندمدلی
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 sm:block">
                  {selectedModel.name}
                </div>

                <button
                  onClick={startNewChat}
                  className="glow-button brand-gradient rounded-2xl px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02] lg:hidden"
                >
                  چت جدید
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <div className="mx-auto max-w-5xl space-y-5">
              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`message-enter max-w-[88%] rounded-3xl px-5 py-4 leading-8 shadow-sm md:max-w-[75%] ${
                        isUser
                          ? "brand-gradient text-white shadow-lg shadow-blue-600/20"
                          : "glass-card text-zinc-100"
                      }`}
                    >
                      <div className="relative z-10 mb-2 flex items-center gap-2 text-xs opacity-70">
                        <span>{isUser ? "شما" : "راستینو"}</span>
                        <span>•</span>
                        <span>
                          {message.createdAt.toLocaleTimeString("fa-IR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="relative z-10 whitespace-pre-wrap text-sm md:text-base">
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-end">
                  <div className="glass-card message-enter max-w-[75%] rounded-3xl px-5 py-4">
                    <div className="relative z-10 mb-2 text-xs text-zinc-500">
                      راستینو
                    </div>
                    <div className="relative z-10 flex items-center gap-2 text-sm text-zinc-400">
                      <span className="pulse-dot h-2 w-2 rounded-full bg-zinc-400" />
                      <span className="pulse-dot h-2 w-2 rounded-full bg-zinc-400" />
                      <span className="pulse-dot h-2 w-2 rounded-full bg-zinc-400" />
                      <span className="mr-2">در حال پردازش...</span>
                    </div>
                  </div>
                </div>
              )}

              {userMessageCount === 0 && (
                <div className="grid gap-3 pt-4 md:grid-cols-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="glass-card rounded-2xl p-4 text-right text-sm leading-7 text-zinc-300 transition hover:border-blue-500/50 hover:bg-blue-500/10"
                    >
                      <span className="relative z-10">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-4 md:px-8">
            <form onSubmit={handleSubmit} className="mx-auto max-w-5xl">
              <div className="glass-panel rounded-3xl p-3 shadow-2xl shadow-black/20">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="text-xs text-zinc-400">
                    مدل فعلی:{" "}
                    <span className="font-bold text-zinc-200">
                      {selectedModel.name}
                    </span>
                  </div>

                  <select
                    value={selectedModelId}
                    onChange={(event) => setSelectedModelId(event.target.value)}
                    className="rounded-xl border border-white/10 bg-[#11131d] px-3 py-2 text-xs text-zinc-200 outline-none"
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end gap-3">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="پیامت رو برای راستینو بنویس..."
                    rows={1}
                    className="max-h-40 min-h-12 flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-7 text-zinc-100 outline-none placeholder:text-zinc-600 md:text-base"
                  />

                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="glow-button brand-gradient rounded-2xl px-5 py-3 text-sm font-black text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ارسال
                  </button>
                </div>
              </div>

              <p className="mt-3 text-center text-xs leading-6 text-zinc-600">
                نسخه آزمایشی راستینو؛ فعلاً پاسخ‌ها از API داخلی برمی‌گردند و اتصال مدل‌های واقعی در مرحله بعد اضافه می‌شود.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
