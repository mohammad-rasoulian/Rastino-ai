"use client";

import { useState } from "react";
import type { ToolId } from "@/lib/app/tool-types";

import { ChatHistory } from "@/components/sidebar/ChatHistory";
import { NewChatButton } from "@/components/sidebar/NewChatButton";
import { SidebarFooter } from "@/components/sidebar/SidebarFooter";
import { SidebarHeader } from "@/components/sidebar/SidebarHeader";
import { SidebarNav } from "@/components/sidebar/SidebarNav";
import { SidebarPanel } from "@/components/sidebar/SidebarPanel";
import type { SidebarPanelType } from "@/components/sidebar/panel-types";
import type { ChatKind } from "@/components/sidebar/types";
import { useSidebarChats } from "@/components/sidebar/useSidebarChats";

type SidebarProps = {
  activeTool: ToolId;
  onToolChange: (tool: ToolId) => void;
  activeChatId: string | null;
  onChatSelect: (chatId: string, kind?: ChatKind) => void;
  onChatCreated: (chatId: string) => void;
  chatRefreshKey: number;
};

export function Sidebar({
  activeTool,
  onToolChange,
  activeChatId,
  onChatSelect,
  onChatCreated,
  chatRefreshKey,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openPanel, setOpenPanel] = useState<SidebarPanelType | null>(null);

  const { chats, loadingChats, startNewChat, deleteChat } = useSidebarChats({
    activeChatId,
    onToolChange,
    onChatCreated,
    chatRefreshKey,
  });

  return (
    <>
      <aside
        className={`r-sidebar hidden h-screen shrink-0 flex-col p-3 lg:flex r-transition ${
          collapsed ? "w-[72px]" : "w-[280px]"
        }`}
      >
        <SidebarHeader
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((prev) => !prev)}
        />

        <NewChatButton collapsed={collapsed} onClick={startNewChat} />

        <SidebarNav
          collapsed={collapsed}
          activeTool={activeTool}
          onToolChange={onToolChange}
        />

        {!collapsed && (
          <ChatHistory
            chats={chats}
            loadingChats={loadingChats}
            activeChatId={activeChatId}
            onChatSelect={onChatSelect}
            onDeleteChat={deleteChat}
          />
        )}

        <div className="mt-auto">
          <SidebarFooter
            collapsed={collapsed}
            onOpenPanel={(panel) => setOpenPanel(panel)}
          />
        </div>
      </aside>

      {openPanel && (
        <SidebarPanel type={openPanel} onClose={() => setOpenPanel(null)} />
      )}
    </>
  );
}
