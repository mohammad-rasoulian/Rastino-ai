"use client";

import { useEffect, useState } from "react";
import { AccountIcon, SettingsIcon } from "./icons";
import type { SidebarPanelType } from "./panel-types";

type SidebarFooterProps = {
  collapsed: boolean;
  onOpenPanel: (panel: SidebarPanelType) => void;
};

type MeResponse = {
  user?: {
    role?: string | null;
    status?: string | null;
  } | null;
};

function AdminIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3.25L5.75 5.7v5.15c0 4.05 2.55 7.7 6.25 9.05 3.7-1.35 6.25-5 6.25-9.05V5.7L12 3.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.25 12.1l1.75 1.75 3.85-4.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SidebarFooter({ collapsed, onOpenPanel }: SidebarFooterProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadMe();
  }, []);

  async function loadMe() {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      const data = (await res.json()) as MeResponse;
      const user = data.user;

      setIsAdmin(user?.role === "admin" && user?.status === "active");
    } catch {
      setIsAdmin(false);
    }
  }

  return (
    <div className="border-t border-[#202020] pt-3">
      {isAdmin && (
        <button
          onClick={() => onOpenPanel("admin")}
          className={`r-sidebar-bottom-button mb-1 ${
            collapsed ? "justify-center" : "justify-start"
          }`}
          title="مدیریت"
        >
          <span className="r-sidebar-bottom-icon">
            <AdminIcon className="h-[18px] w-[18px]" />
          </span>

          {!collapsed && <span>مدیریت</span>}
        </button>
      )}

      <button
        onClick={() => onOpenPanel("settings")}
        className={`r-sidebar-bottom-button ${
          collapsed ? "justify-center" : "justify-start"
        }`}
        title="تنظیمات"
      >
        <span className="r-sidebar-bottom-icon">
          <SettingsIcon className="h-[18px] w-[18px]" />
        </span>

        {!collapsed && <span>تنظیمات</span>}
      </button>

      <button
        onClick={() => onOpenPanel("account")}
        className={`r-sidebar-bottom-button mt-1 ${
          collapsed ? "justify-center" : "justify-start"
        }`}
        title="حساب کاربری"
      >
        <span className="r-sidebar-bottom-icon">
          <AccountIcon className="h-[18px] w-[18px]" />
        </span>

        {!collapsed && <span>حساب کاربری</span>}
      </button>
    </div>
  );
}
