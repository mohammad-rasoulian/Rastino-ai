import type { AdminTab } from "./admin-types";

type AdminTabsProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
};

const tabs: { id: AdminTab; label: string; hint: string }[] = [
  { id: "overview", label: "مرکز فرمان", hint: "آمار کلی" },
  { id: "users", label: "کاربران", hint: "کنترل حساب‌ها" },
  { id: "chats", label: "چت‌ها", hint: "پیام‌ها و گفتگوها" },
  { id: "content", label: "CMS", hint: "متن سایت" },
  { id: "system", label: "سیستم", hint: "سلامت زیرساخت" },
  { id: "security", label: "امنیت", hint: "لاگ و ریسک" },
  { id: "plans", label: "پلن‌ها", hint: "قیمت و محدودیت" },
  { id: "prompts", label: "پرامپت‌ها", hint: "رفتار AI" },
  { id: "models", label: "مدل‌ها", hint: "AI Catalog" },
  { id: "settings", label: "تنظیمات", hint: "کنترل محصول" },
];

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`admin-tab text-right ${
            activeTab === tab.id ? "admin-tab-active" : ""
          }`}
        >
          <span className="block font-black">{tab.label}</span>
          <span className="mt-1 block text-[10px] opacity-70">{tab.hint}</span>
        </button>
      ))}
    </div>
  );
}
