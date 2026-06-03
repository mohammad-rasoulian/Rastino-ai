import type { SidebarPanelType } from "../panel-types";

type PanelHeaderProps = {
  type: SidebarPanelType;
  onClose: () => void;
};

function getPanelMeta(type: SidebarPanelType) {
  if (type === "account") {
    return {
      eyebrow: "Account",
      title: "حساب کاربری",
    };
  }

  if (type === "admin") {
    return {
      eyebrow: "Admin",
      title: "مدیریت",
    };
  }

  return {
    eyebrow: "Settings",
    title: "تنظیمات",
  };
}

export function PanelHeader({ type, onClose }: PanelHeaderProps) {
  const meta = getPanelMeta(type);

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#202020] px-5">
      <div>
        <p className="text-xs r-muted">{meta.eyebrow}</p>
        <h2 className="text-lg font-black">{meta.title}</h2>
      </div>

      <button
        onClick={onClose}
        className="r-secondary flex h-10 w-10 items-center justify-center rounded-2xl text-xl"
        title="بستن"
      >
        ×
      </button>
    </header>
  );
}
