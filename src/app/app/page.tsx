"use client";

import { useState } from "react";

import { AppSettingsBoot } from "@/components/AppSettingsBoot";
import { AuthGate } from "@/components/auth/AuthGate";
import { Sidebar } from "@/components/Sidebar";
import { Chat } from "@/components/Chat";
import { ImageTool } from "@/components/ImageTool";
import type { ToolId } from "@/lib/app/tool-types";
import { StudentTool } from "@/components/student/StudentTool";

export default function Home() {
  const [activeTool, setActiveTool] = useState<ToolId>("chat");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatRefreshKey, setChatRefreshKey] = useState(0);

  function refreshChats() {
    setChatRefreshKey((prev) => prev + 1);
  }

  return (
    <AuthGate>
      <AppSettingsBoot />

      <main dir="rtl" className="app-shell min-h-screen text-zinc-100">
        <div className="flex min-h-screen">
          <Sidebar
            activeTool={activeTool}
            onToolChange={(tool) => {
              setActiveTool(tool);

              if (tool === "image") {
                setActiveChatId(null);
              }
            }}
            activeChatId={activeChatId}
            onChatSelect={(chatId, kind = "chat") => {
              setActiveTool(kind);
              setActiveChatId(chatId);
            }}
            onChatCreated={(chatId) => {
              setActiveTool("chat");
              setActiveChatId(chatId);
              refreshChats();
            }}
            chatRefreshKey={chatRefreshKey}
          />

          <section className="flex min-w-0 flex-1 flex-col p-4">
            {activeTool === "chat" && (
              <Chat
                activeChatId={activeChatId}
                onChatCreated={(chatId) => {
                  setActiveChatId(chatId);
                  refreshChats();
                }}
                onChatUpdated={refreshChats}
              />
            )}

            {activeTool === "student" && (
              <StudentTool
                onChatCreated={(chatId) => {
                  setActiveTool("chat");
                  setActiveChatId(chatId);
                  setChatRefreshKey((value) => value + 1);
                }}
              />
            )}

            {activeTool === "image" && (
              <ImageTool
                activeImageChatId={activeChatId}
                onImageChatSaved={() => {
                  setActiveTool("image");
                  refreshChats();
                }}
              />
            )}
          </section>
        </div>
      </main>
    </AuthGate>
  );
}
