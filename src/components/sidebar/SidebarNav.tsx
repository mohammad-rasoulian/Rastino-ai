"use client";

import type { ToolId } from "@/lib/app/tool-types";
import { sidebarTools } from "./sidebar-data";

type SidebarNavProps = {
  collapsed: boolean;
  activeTool: ToolId;
  onToolChange: (tool: ToolId) => void;
};

export function SidebarNav({
  collapsed,
  activeTool,
  onToolChange,
}: SidebarNavProps) {
  return (
    <nav className="mt-5 flex flex-col gap-2">
      {sidebarTools.map((tool) => {
        const active = activeTool === tool.id;
        const Icon = tool.icon;

        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            title={collapsed ? tool.label : undefined}
            className={`r-nav-card ${active ? "r-nav-card-active" : ""} ${
              collapsed ? "justify-center px-2" : "justify-start px-3"
            }`}
          >
            <span className="r-nav-icon-wrap">
              <Icon className="relative z-10 h-6 w-6" />
            </span>

            {!collapsed && (
              <span className="min-w-0 text-right">
                <span className="block text-sm font-black">{tool.label}</span>
                <span
                  className={`mt-0.5 block text-[11px] ${
                    active ? "text-black/60" : "r-muted"
                  }`}
                >
                  {tool.hint}
                </span>
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
