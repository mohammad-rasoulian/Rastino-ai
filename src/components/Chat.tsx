"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { WelcomePanel } from "@/components/chat/WelcomePanel";
import { models } from "@/components/chat/chat-data";
import {
  getDefaultModelForPlan,
  normalizePlan,
  type RastinoPlanTier,
} from "@/lib/ai/model-catalog";
import type { ChatProps, Message, ModelId, ToneMode } from "@/components/chat/types";
import { createSafeId } from "@/lib/client/safe-id";

type ChatUploadAttachment = {
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  url?: string;
  content?: string;
  [key: string]: unknown;
};


export function Chat({
  activeChatId,
  onChatCreated,
  onChatUpdated,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(
    activeChatId
  );
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelId>(
    getDefaultModelForPlan("free")
  );
  const [userPlan, setUserPlan] = useState<RastinoPlanTier>("free");
  const [isAdmin, setIsAdmin] = useState(false);
  const [toneMode, setToneMode] = useState<ToneMode>("adaptive-human");
  const [deepThinking, setDeepThinking] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [showPromptBox, setShowPromptBox] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const availableModels = useMemo(
    () => models.filter((model) => model.tier === userPlan),
    [userPlan]
  );
  const localCreatedChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    async function loadCurrentUserPlan() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        const data = await res.json().catch(() => null);
        const plan = normalizePlan(data?.user?.plan);

        setUserPlan(plan);
        setIsAdmin(data?.user?.role === "admin");
        setSelectedModel(getDefaultModelForPlan(plan));
      } catch {
        setUserPlan("free");
        setIsAdmin(false);
        setSelectedModel(getDefaultModelForPlan("free"));
      }
    }

    loadCurrentUserPlan();
  }, []);

  useEffect(() => {
    setCurrentChatId(activeChatId);

    if (!activeChatId) {
      setMessages([]);
      setInput("");
      setFiles([]);
      setIsLoading(false);
      setToneMode("adaptive-human");
      return;
    }

    if (localCreatedChatIdRef.current === activeChatId) {
      localCreatedChatIdRef.current = null;
      return;
    }

    loadMessages(activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    const reset = () => {
      localCreatedChatIdRef.current = null;
      setCurrentChatId(null);
      setMessages([]);
      setInput("");
      setFiles([]);
      setIsLoading(false);
    };

    window.addEventListener("rastino:new-chat", reset);
    return () => window.removeEventListener("rastino:new-chat", reset);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isLoadingMessages]);

  useEffect(() => {
    const canUseSelectedModel = availableModels.some(
      (model) => model.id === selectedModel
    );

    if (!canUseSelectedModel) {
      setSelectedModel(getDefaultModelForPlan(userPlan));
    }
  }, [availableModels, selectedModel, userPlan]);



  async function loadMessages(chatId: string) {
    setIsLoadingMessages(true);

    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      setMessages(
        (data?.messages || []).map(
          (message: {
            id: string;
            role: string;
            content: string;
            model?: ModelId | null;
            metadata?: string | null;
          }) => {
            let metadata: {
              deepThinking?: boolean;
              systemPrompt?: string;
              toneMode?: ToneMode;
            } = {};

            if (message.metadata) {
              try {
                metadata = JSON.parse(message.metadata);
              } catch {
                metadata = {};
              }
            }

            return {
              id: message.id,
              role: message.role === "assistant" ? "assistant" : "user",
              content: message.content,
              model: message.model || undefined,
              deepThinking: metadata.deepThinking,
              systemPrompt: metadata.systemPrompt,
              toneMode: metadata.toneMode,
            };
          }
        )
      );
    } finally {
      setIsLoadingMessages(false);
    }
  }

  async function createChatIfNeeded(firstMessage: string) {
    if (currentChatId) return currentChatId;

    const title =
      firstMessage.length > 42
        ? `${firstMessage.slice(0, 42)}...`
        : firstMessage;

    const res = await fetch("/api/chats", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: title || "چت جدید" }),
    });

    const data = await res.json().catch(() => null);
    const chatId = data?.chat?.id;

    if (!res.ok || !chatId) {
      throw new Error(data?.error || "Chat was not created");
    }

    localCreatedChatIdRef.current = chatId;
    setCurrentChatId(chatId);
    onChatCreated(chatId);

    return chatId;
  }

  async function changeAdminPlanPreview(plan: RastinoPlanTier) {
    if (!isAdmin) return;

    const res = await fetch("/api/admin/me/plan", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error || "تغییر پلن ادمین ناموفق بود.");
      return;
    }

    setUserPlan(plan);
    setSelectedModel(getDefaultModelForPlan(plan));
    onChatUpdated();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    event.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });
  }

  async function buildImageAttachments(
    selectedFiles: File[]
  ): Promise<ChatUploadAttachment[]> {
    const maxImageSize = 3 * 1024 * 1024;
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    const tooLargeFiles = imageFiles.filter((file) => file.size > maxImageSize);
    const acceptedImages = imageFiles
      .filter((file) => file.size <= maxImageSize)
      .slice(0, 4);

    if (tooLargeFiles.length > 0) {
      alert("فعلاً هر تصویر باید کمتر از ۳ مگابایت باشد.");
    }

    return Promise.all(
      acceptedImages.map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: await fileToDataUrl(file),
      }))
    );
  }

  async function readStreamIntoMessage(
    response: Response,
    assistantTempId: string
  ) {
    if (!response.body) {
      throw new Error("Streaming body is empty");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantContent = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      assistantContent += chunk;

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantTempId
            ? {
                ...message,
                content: assistantContent,
              }
            : message
        )
      );
    }
  }

  async function sendMessage() {
    console.log("[RASTINO_SEND_ATTEMPT]", {
      input,
      filesCount: files.length,
      isLoading,
      currentChatId,
      selectedModel,
    });

    const content = input.trim();
    const cleanSystemPrompt = systemPrompt.trim();

    if ((!content && files.length === 0) || isLoading) return;

    const fileNames = files.map((file) => file.name);
    const attachments = await buildImageAttachments(files);

    const userTempId = `user-${createSafeId()}`;
    const assistantTempId = `assistant-${createSafeId()}`;

    const userMessage: Message = {
      id: userTempId,
      role: "user",
      content: content || "فایل پیوست شد.",
      model: selectedModel,
      deepThinking,
      toneMode,
      files: fileNames,
      systemPrompt: cleanSystemPrompt || undefined,
    };

    const assistantMessage: Message = {
      id: assistantTempId,
      role: "assistant",
      content: "",
      model: selectedModel,
      deepThinking,
      toneMode,
      systemPrompt: cleanSystemPrompt || undefined,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setFiles([]);
    setIsLoading(true);

    try {
      const chatId = await createChatIfNeeded(content || "فایل پیوست شد");

      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: userMessage.content,
          model: selectedModel,
          toneMode,
          deepThinking,
          systemPrompt: cleanSystemPrompt,
          files: fileNames,
          attachments,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Message request failed");
      }

      await readStreamIntoMessage(res, assistantTempId);
      onChatUpdated();
    } catch (error) {
      console.error("[CHAT SEND ERROR]", error);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantTempId
            ? {
                ...message,
                content: "خطا در ذخیره یا دریافت پاسخ از سرور راستینو.",
              }
            : message
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      console.log("[RASTINO_ENTER_KEY]");
      event.preventDefault();
      sendMessage();
    }
  }

  const showWelcome = !isLoadingMessages && messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[2rem] border border-[#181818] bg-[#080808]">
      <ChatHeader
        currentChatId={currentChatId}
        selectedModel={selectedModel}
        models={availableModels}
      />

      <section className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-7">
          {showWelcome && (
            <WelcomePanel onSuggestionSelect={(value) => setInput(value)} />
          )}

          <MessageList
            messages={messages}
            models={availableModels}
            isLoading={isLoading}
            isLoadingMessages={isLoadingMessages}
            bottomRef={bottomRef}
          />
        </div>
      </section>

      <ChatComposer
        input={input}
        setInput={setInput}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        toneMode={toneMode}
        setToneMode={setToneMode}
        deepThinking={deepThinking}
        setDeepThinking={setDeepThinking}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        showPromptBox={showPromptBox}
        setShowPromptBox={setShowPromptBox}
        files={files}
        fileInputRef={fileInputRef}
        models={availableModels}
        userPlan={userPlan}
        isAdmin={isAdmin}
        onAdminPlanChange={changeAdminPlanPreview}
        isLoading={isLoading}
        onFileChange={handleFileChange}
        onRemoveFile={removeFile}
        onSendMessage={sendMessage}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
