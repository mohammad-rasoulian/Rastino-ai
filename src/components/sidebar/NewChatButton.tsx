"use client";

import { PlusIcon } from "./icons";

type NewChatButtonProps = {
  collapsed: boolean;
  onClick: () => void;
};

export function NewChatButton({ collapsed, onClick }: NewChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`r-new-chat-button mt-4 h-11 rounded-2xl text-sm font-black ${
        collapsed ? "w-11" : "w-full"
      }`}
      title="چت جدید"
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        <PlusIcon className="h-4 w-4" />
        {!collapsed && <span>چت جدید</span>}
      </span>
    </button>
  );
}
