"use client";

import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import type { SidebarPanelType } from "./panel-types";
import { AccountPanel } from "./panels/AccountPanel";
import type { AccountUser } from "./panels/account-data";
import { PanelHeader } from "./panels/PanelHeader";

type SidebarPanelProps = {
  type: SidebarPanelType;
  onClose: () => void;
};

export function SidebarPanel({ type, onClose }: SidebarPanelProps) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(type === "account");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (type !== "account") return;

    loadUser();
  }, [type]);

  async function loadUser() {
    setLoadingUser(true);

    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      const data = await res.json();
      setUser(data.user || null);
    } finally {
      setLoadingUser(false);
    }
  }

  async function logout() {
    const confirmed = window.confirm("می‌خواهی از حساب خارج شوی؟");
    if (!confirmed) return;

    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      window.location.reload();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-sm">
      <div className="h-full w-full max-w-[430px] overflow-hidden border-r border-[#242424] bg-[#080808] shadow-2xl">
        <PanelHeader type={type} onClose={onClose} />

        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-5">
          {type === "settings" && <SettingsPanel />}

          {type === "admin" && <AdminPanel />}

          {type === "account" && (
            <AccountPanel
              user={user}
              loadingUser={loadingUser}
              loggingOut={loggingOut}
              onLogout={logout}
            />
          )}
        </div>
      </div>
    </div>
  );
}
