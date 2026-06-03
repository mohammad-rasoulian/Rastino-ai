import type { SidebarTool } from "./types";
import { ChatIcon, ImageIcon, StudentIcon } from "./icons";

export const sidebarTools: SidebarTool[] = [
  {
    id: "chat",
    label: "چت",
    icon: ChatIcon,
    hint: "دستیار هوشمند",
  },
  {
    id: "image",
    label: "تصویر",
    icon: ImageIcon,
    hint: "تولید تصویر",
  },
  {
    id: "student",
    label: "دانش‌آموز",
    icon: StudentIcon,
    hint: "کتاب، مشاور، برنامه",
  },
];
