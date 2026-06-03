"use client";

import { BrandLogo } from "@/components/brand/BrandLogo";

type SidebarHeaderProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function SidebarHeader({
  collapsed,
  onToggleCollapsed,
}: SidebarHeaderProps) {
  return (
    <div className="flex h-12 items-center gap-2">
      <button
        onClick={onToggleCollapsed}
        className="r-mini-icon-button shrink-0"
        title={collapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
      >
        {collapsed ? "☰" : "×"}
      </button>

      {!collapsed && (
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo size="sm" />

          <div className="min-w-0">
            <h1 className="truncate text-lg font-black">راستینو</h1>
            <p className="truncate text-xs r-muted">AI workspace</p>
          </div>
        </div>
      )}
    </div>
  );
}
