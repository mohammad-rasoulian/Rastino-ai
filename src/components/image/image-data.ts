import type {
  AspectRatio,
  ImageModelId,
  ImageModelInfo,
  ImageQualityInfo,
} from "./types";

export const defaultImageModel: ImageModelId = "z-image-turbo";

export const imageModels: ImageModelInfo[] = [
  {
    id: "z-image-turbo",
    name: "Rastino Fast",
    titleFa: "تصویر سریع پایه",
    badge: "Free",
    description: "مدل رایگان و سریع برای تست ایده‌ها؛ مناسب استفاده سبک روزانه",
    tier: "free",
    creditCost: 1,
    estimatedTime: "۲۰ تا ۴۵ ثانیه",
  },

  {
    id: "imagen-4.0-ultra-generate-001",
    name: "Imagen Ultra",
    titleFa: "تصویر Ultra",
    badge: "Plus",
    description: "خروجی تمیز و باکیفیت برای بنر، پست، کاور و تصاویر حرفه‌ای",
    tier: "plus",
    creditCost: 4,
    estimatedTime: "۳۰ تا ۷۵ ثانیه",
  },
  {
    id: "gemini-2.5-flash-image",
    name: "Gemini Flash",
    titleFa: "تصویر هوشمند چندوجهی",
    badge: "Plus",
    description: "مناسب پرامپت‌های پیچیده‌تر، تصویرسازی کاربردی و خروجی سریع",
    tier: "plus",
    creditCost: 3,
    estimatedTime: "۳۰ تا ۷۵ ثانیه",
  },

  {
    id: "gemini-3.1-flash-image",
    name: "Gemini Advanced",
    titleFa: "تصویر پیشرفته Gemini",
    badge: "Pro",
    description: "مدل پیشرفته‌تر برای خروجی دقیق، سناریوهای پیچیده و کیفیت بالاتر",
    tier: "pro",
    creditCost: 6,
    estimatedTime: "۴۵ تا ۱۲۰ ثانیه",
  },
  {
    id: "gpt-5.2",
    name: "GPT Studio",
    titleFa: "تصویر حرفه‌ای GPT",
    badge: "Pro",
    description: "برای بهترین دستورپذیری، ایده‌پردازی تصویری و خروجی‌های خاص",
    tier: "pro",
    creditCost: 8,
    estimatedTime: "۴۵ تا ۱۲۰ ثانیه",
  },
];

export const styles = [
  "سینمایی",
  "واقع‌گرایانه",
  "مینیمال",
  "پوستر تبلیغاتی",
  "سه‌بعدی",
  "ایزومتریک",
  "انیمه",
  "لوکس و تاریک",
];

export const imageStyles = styles;

export const aspectRatios: AspectRatio[] = [
  "1:1",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
];

export const qualities: ImageQualityInfo[] = [
  { id: "standard", label: "Standard", hint: "سریع و اقتصادی" },
  { id: "high", label: "High", hint: "جزئیات بیشتر" },
  { id: "ultra", label: "Ultra", hint: "کیفیت نمایشی" },
];

export const imageQualities = qualities;

export type ImagePresetId =
  | "social-post"
  | "story"
  | "website-banner"
  | "ad-poster"
  | "logo-concept"
  | "product-shot"
  | "profile"
  | "wallpaper";

export const imagePresets: {
  id: ImagePresetId;
  title: string;
  badge: string;
  aspectRatio: AspectRatio;
  style: string;
  quality: "standard" | "high" | "ultra";
  promptHint: string;
}[] = [
  {
    id: "social-post",
    title: "پست شبکه اجتماعی",
    badge: "1:1",
    aspectRatio: "1:1",
    style: "پوستر تبلیغاتی",
    quality: "high",
    promptHint:
      "ترکیب‌بندی مربعی، متن خوانا، کنتراست بالا، مناسب پست اینستاگرام",
  },
  {
    id: "story",
    title: "استوری",
    badge: "9:16",
    aspectRatio: "9:16",
    style: "سینمایی",
    quality: "high",
    promptHint:
      "ترکیب عمودی، سوژه مرکزی، فضای مناسب برای متن، مناسب موبایل",
  },
  {
    id: "website-banner",
    title: "بنر سایت",
    badge: "16:9",
    aspectRatio: "16:9",
    style: "مینیمال",
    quality: "high",
    promptHint:
      "بنر افقی، فضای خالی برای تیتر، ظاهر حرفه‌ای و مناسب صفحه اصلی سایت",
  },
  {
    id: "ad-poster",
    title: "پوستر تبلیغاتی",
    badge: "Ad",
    aspectRatio: "4:3",
    style: "پوستر تبلیغاتی",
    quality: "ultra",
    promptHint:
      "ظاهر تبلیغاتی، تمرکز روی پیام اصلی، نورپردازی جذاب و خروجی آماده کمپین",
  },
  {
    id: "logo-concept",
    title: "کانسپت لوگو",
    badge: "Logo",
    aspectRatio: "1:1",
    style: "مینیمال",
    quality: "high",
    promptHint:
      "لوگوی ساده، قابل تشخیص، مینیمال، بدون جزئیات اضافه، مناسب برند مدرن",
  },
  {
    id: "product-shot",
    title: "تصویر محصول",
    badge: "Product",
    aspectRatio: "4:3",
    style: "واقع‌گرایانه",
    quality: "ultra",
    promptHint:
      "نمای محصول، پس‌زمینه تمیز، نورپردازی استودیویی، حس واقعی و حرفه‌ای",
  },
  {
    id: "profile",
    title: "تصویر پروفایل",
    badge: "Avatar",
    aspectRatio: "1:1",
    style: "سه‌بعدی",
    quality: "high",
    promptHint:
      "آواتار یا تصویر پروفایل، سوژه مرکزی، ظاهر تمیز و قابل استفاده در شبکه‌های اجتماعی",
  },
  {
    id: "wallpaper",
    title: "والپیپر",
    badge: "16:9",
    aspectRatio: "16:9",
    style: "لوکس و تاریک",
    quality: "ultra",
    promptHint:
      "تصویر عریض، جزئیات زیاد، فضای چشم‌نواز، مناسب پس‌زمینه دسکتاپ یا موبایل",
  },
];

export const brandTones = [
  "لوکس و تیره",
  "مینیمال و تمیز",
  "دوستانه و گرم",
  "آینده‌نگر و تکنولوژیک",
  "پرانرژی و رنگی",
  "رسمی و قابل اعتماد",
];

export const promptIdeas = [
  "یک تصویر تبلیغاتی حرفه‌ای برای برند راستینو",
  "یک فضای کاری مدرن با نور ملایم، لپ‌تاپ و یادداشت‌ها",
  "کاور اینستاگرام برای معرفی یک ابزار هوش مصنوعی",
  "لوگوی مینیمال برای اپلیکیشن هوشمند با حس آینده‌نگر",
];

export type ImageBoostId =
  | "premium-ad"
  | "cinematic-light"
  | "clean-product"
  | "persian-typography"
  | "luxury-dark"
  | "viral-social";

export const imageBoosts: {
  id: ImageBoostId;
  title: string;
  description: string;
  promptAddon: string;
}[] = [
  {
    id: "premium-ad",
    title: "تبلیغاتی حرفه‌ای",
    description: "برای کمپین، بنر و معرفی محصول",
    promptAddon:
      "ظاهر تصویر شبیه یک تبلیغ حرفه‌ای برندهای بزرگ باشد؛ پیام اصلی واضح، ترکیب‌بندی جذاب، نورپردازی کنترل‌شده و خروجی آماده کمپین تبلیغاتی باشد.",
  },
  {
    id: "cinematic-light",
    title: "نور سینمایی",
    description: "عمق، کنتراست و حس فیلمی",
    promptAddon:
      "نورپردازی سینمایی، عمق میدان، کنتراست کنترل‌شده، هایلایت‌های نرم و حس بصری شبیه فریم فیلم حرفه‌ای داشته باشد.",
  },
  {
    id: "clean-product",
    title: "محصول تمیز",
    description: "برای معرفی اپ، کالا یا سرویس",
    promptAddon:
      "تمرکز تصویر روی محصول یا سرویس باشد؛ پس‌زمینه تمیز، فضای منفی مناسب، حس قابل اعتماد و خروجی مناسب صفحه محصول داشته باشد.",
  },
  {
    id: "persian-typography",
    title: "تایپوگرافی فارسی",
    description: "برای پوستر و کاور فارسی",
    promptAddon:
      "اگر متن فارسی داخل تصویر وجود دارد، باید کوتاه، خوانا، درست، تمیز و هماهنگ با ترکیب‌بندی باشد. از متن‌های طولانی و نوشته‌های خراب پرهیز شود.",
  },
  {
    id: "luxury-dark",
    title: "لوکس و تاریک",
    description: "استایل مشکی، پریمیوم و شیک",
    promptAddon:
      "فضای تصویر لوکس، تیره، مینیمال و پریمیوم باشد؛ رنگ‌های مشکی، خاکستری، سفید و نورهای ظریف برای حس حرفه‌ای استفاده شود.",
  },
  {
    id: "viral-social",
    title: "وایرال شبکه اجتماعی",
    description: "برای جلب توجه سریع",
    promptAddon:
      "تصویر باید در نگاه اول توجه کاربر را جلب کند؛ سوژه واضح، کنتراست بالا، پیام سریع، قاب‌بندی جذاب و مناسب شبکه‌های اجتماعی باشد.",
  },
];
