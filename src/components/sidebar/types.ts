import type { ComponentType } from "react";
import type { ToolId } from "@/lib/app/tool-types";

export type ChatKind = "chat" | "image";

export type ChatItem = {
  id: string;
  title: string;
  createdAt: string;
};

export type SidebarProps = {
  activeTool: ToolId;
  onToolChange: (tool: ToolId) => void;
  activeChatId: string | null;
  onChatSelect: (chatId: string, kind?: ChatKind) => void;
  onChatCreated: (chatId: string) => void;
  chatRefreshKey: number;
};

export type IconProps = {
  className?: string;
};

export type SidebarTool = {
  id: ToolId;
  label: string;
  icon: ComponentType<IconProps>;
  hint: string;
};
