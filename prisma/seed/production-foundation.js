const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function upsertPlans() {
  const plans = [
    {
      key: "free",
      name: "Free",
      description: "شروع رایگان برای تست راستینو",
      price: 0,
      monthlyMessages: 600,
      dailyMessages: 20,
      maxInputTokens: 800,
      maxOutputTokens: 800,
      allowFiles: false,
      allowImages: false,
      allowOcr: false,
      priority: 0,
    },
    {
      key: "plus",
      name: "Plus",
      description: "پلن روزمره برای استفاده عمومی",
      price: 199000,
      monthlyMessages: 600,
      dailyMessages: 80,
      maxInputTokens: 2000,
      maxOutputTokens: 2000,
      allowFiles: true,
      allowImages: true,
      allowOcr: false,
      priority: 1,
    },
    {
      key: "pro",
      name: "Pro",
      description: "پلن کامل برای استفاده سنگین",
      price: 649000,
      monthlyMessages: 2500,
      dailyMessages: 250,
      maxInputTokens: 4000,
      maxOutputTokens: 4000,
      allowFiles: true,
      allowImages: true,
      allowOcr: true,
      priority: 2,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { key: plan.key },
      update: plan,
      create: plan,
    });
  }
}

async function upsertPrompts() {
  const prompts = [
    {
      key: "solve_step_by_step",
      title: "حل مسئله مرحله‌به‌مرحله",
      category: "education",
      description: "حل مسئله با توضیح ساده و نکات کاری",
      content:
        "تو دستیار هوشمند راستینو هستی. مسئله یا درخواست کاربر را مرحله‌به‌مرحله حل کن، زبان ساده داشته باش و در پایان پیشنهاد کاربردی بده.",
    },
    {
      key: "summarize_content",
      title: "خلاصه‌سازی متن",
      category: "education",
      description: "تبدیل متن به خلاصه، نکات کلیدی و چک‌لیست",
      content:
        "متن را به خلاصه کوتاه، نکات کلیدی، چک‌لیست و خروجی آماده استفاده تبدیل کن.",
    },
    {
      key: "content_review",
      title: "برنامه‌ریزی و مرور سریع",
      category: "education",
      description: "مرور سریع و کاربردی برای یادگیری یا انجام کار",
      content:
        "مثل یک معلم صبور، مطالب را برای برنامه‌ریزی و مرور سریع خلاصه کن، نکات پرتکرار و دام‌های تستی را مشخص کن.",
    },
    {
      key: "image_prompt",
      title: "پرامپت تولید تصویر",
      category: "image",
      description: "ساخت پرامپت حرفه‌ای برای تصویر",
      content:
        "از ایده کاربر یک پرامپت دقیق، تصویری، حرفه‌ای و مناسب تولید تصویر بساز. سبک، نورپردازی، ترکیب‌بندی و نسبت تصویر را پیشنهاد بده.",
    },
  ];

  for (const prompt of prompts) {
    await prisma.promptTemplate.upsert({
      where: { key: prompt.key },
      update: prompt,
      create: prompt,
    });
  }
}

async function main() {
  await upsertPlans();
  await upsertPrompts();

  console.log("✅ Production foundation seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
