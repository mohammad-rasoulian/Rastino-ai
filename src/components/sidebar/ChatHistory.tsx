"use client";

import type { ChatItem, ChatKind } from "./types";

type ChatHistoryProps = {
  chats: ChatItem[];
  loadingChats: boolean;
  activeChatId: string | null;
  onChatSelect: (chatId: string, kind?: ChatKind) => void;
  onDeleteChat: (chatId: string) => void;
};

function isImageChat(title: string) {
  return title.startsWith("🖼️ تصویر:") || title.startsWith("تصویر:");
}

export function ChatHistory({
  chats,
  loadingChats,
  activeChatId,
  onChatSelect,
  onDeleteChat,
}: ChatHistoryProps) {
  return (
    <div className="mt-5 flex min-h-0 flex-1 flex-col border-t border-[#202020] pt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold r-muted">تاریخچه</p>
        {loadingChats && <span className="text-[10px] r-muted">...</span>}
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {chats.length === 0 && (
          <p className="px-2 py-3 text-xs leading-6 r-muted">
            هنوز چتی ذخیره نشده. با دکمه «چت جدید» شروع کن.
          </p>
        )}

        {chats.map((chat) => {
          const active = activeChatId === chat.id;
          const imageChat = isImageChat(chat.title);

          return (
            <div
              key={chat.id}
              className={`group flex items-center gap-1 rounded-xl transition ${
                imageChat
                  ? active
                    ? "image-history-item image-history-item-active"
                    : "image-history-item"
                  : active
                    ? "bg-[#f5f5f5] text-[#070707]"
                    : "text-zinc-300 hover:bg-[#181818]"
              }`}
            >
              <button
                onClick={() => onChatSelect(chat.id, imageChat ? "image" : "chat")}
                className="min-w-0 flex-1 px-3 py-2 text-right text-sm"
                title={chat.title}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {imageChat && (
                    <span className="image-history-badge">تصویری</span>
                  )}

                  <span className="truncate">
                    {chat.title || "چت بدون عنوان"}
                  </span>
                </span>
              </button>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className={`ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs opacity-0 transition group-hover:opacity-100 ${
                  active
                    ? "text-current hover:bg-black/10"
                    : "text-zinc-500 hover:bg-white/10 hover:text-red-300"
                }`}
                title="حذف چت"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
