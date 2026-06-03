"use client";

import { CloseIcon, MenuIcon } from "./icons";

type SidebarBrandProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function SidebarBrand({ collapsed, onToggle }: SidebarBrandProps) {
  return (
    <div className="flex h-12 items-center gap-2">
      <button
        onClick={onToggle}
        className="r-mini-icon-button"
        title={collapsed ? "باز کردن" : "بستن"}
      >
        {collapsed ? (
          <MenuIcon className="h-5 w-5" />
        ) : (
          <CloseIcon className="h-5 w-5" />
        )}
      </button>

      {!collapsed && (
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black">راستینو</h1>
          <p className="truncate text-xs r-muted">دستیار هوشمند برای همه</p>
        </div>
      )}
    </div>
  );
}
