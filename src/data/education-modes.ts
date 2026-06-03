export type EducationModeId =
  | "solve"
  | "summarize"
  | "quiz"
  | "review";

export type EducationMode = {
  id: EducationModeId;
  title: string;
  description: string;
  icon: string;
  systemPrompt: string;
};

export const educationModes: EducationMode[] = [
  {
    id: "solve",
    title: "حل مسئله",
    description: "مرحله‌به‌مرحله + نکات کاری",
    icon: "✍️",
    systemPrompt:
      "مثل یک دستیار حرفه‌ای مرحله‌به‌مرحله حل کن و نکات کاری را توضیح بده.",
  },

  {
    id: "summarize",
    title: "خلاصه کن",
    description: "متن → نکات مهم و بولت",
    icon: "📝",
    systemPrompt:
      "متن را خلاصه و نکات کلیدی را بولت‌بندی کن.",
  },

  {
    id: "quiz",
    title: "سوال بساز",
    description: "تستی + تشریحی",
    icon: "❓",
    systemPrompt:
      "از متن ورودی سوال تستی و تشریحی استاندارد طراحی کن.",
  },

  {
    id: "review",
    title: "مرور کار",
    description: "جمع‌بندی سریع شب کار",
    icon: "⚡",
    systemPrompt:
      "مطالب را برای شب کار فشرده و کاربردی مرور کن.",
  },
];
