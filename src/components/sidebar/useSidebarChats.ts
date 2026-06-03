"use client";

import { useEffect, useState } from "react";
import type { ChatItem, SidebarProps } from "./types";

type UseSidebarChatsArgs = Pick<
  SidebarProps,
  "activeChatId" | "onToolChange" | "onChatCreated" | "chatRefreshKey"
>;

export function useSidebarChats({
  activeChatId,
  onToolChange,
  onChatCreated,
  chatRefreshKey,
}: UseSidebarChatsArgs) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  async function loadChats() {
    setLoadingChats(true);

    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      setChats(data.chats || []);
    } finally {
      setLoadingChats(false);
    }
  }

  async function startNewChat() {
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "چت جدید" }),
    });

    const data = await res.json();

    if (data.chat?.id) {
      onChatCreated(data.chat.id);
      loadChats();
    }
  }

  async function deleteChat(chatId: string) {
    const confirmed = window.confirm("این چت حذف شود؟");
    if (!confirmed) return;

    const res = await fetch(`/api/chats/${chatId}`, {
      method: "DELETE",
    });

    if (!res.ok) return;

    setChats((prev) => prev.filter((chat) => chat.id !== chatId));

    if (activeChatId === chatId) {
      onToolChange("chat");
      window.dispatchEvent(new CustomEvent("rastino:new-chat"));
    }
  }

  useEffect(() => {
    loadChats();
  }, [chatRefreshKey]);

  return {
    chats,
    loadingChats,
    loadChats,
    startNewChat,
    deleteChat,
  };
}
