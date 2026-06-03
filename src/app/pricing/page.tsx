import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const metadata: Metadata = {
  title: "تعرفه‌ها و پلن‌های راستینو",
  description:
    "مشاهده پلن‌های رایگان، پلاس و پرو راستینو برای استفاده از دستیار هوشمند فارسی.",
};

const plans = [
  {
    name: "Free",
    price: "رایگان",
    description: "برای آشنایی اولیه با راستینو",
    features: ["شروع سریع", "چت پایه", "تعداد پیام محدود", "مناسب تست اولیه"],
  },
  {
    name: "Plus",
    price: "به‌زودی",
    description: "برای استفاده روزمره و منظم",
    features: ["پیام بیشتر", "مدل‌های بهتر", "تاریخچه چت", "ابزارهای کاربردی"],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "به‌زودی",
    description: "برای کاربران حرفه‌ای و استفاده سنگین‌تر",
    features: ["اولویت پردازش", "ظرفیت بیشتر", "ابزارهای پیشرفته", "امکانات تکمیلی"],
  },
];

export default function PricingPage() {
  return (
    <main dir="rtl" className="landing-shell min-h-screen text-zinc-100">
      <section className="mx-auto max-w-6xl px-5 py-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <BrandLogo size="sm" />
          <span className="text-lg font-black">راستینو</span>
        </Link>

        <div className="mt-10">
          <p className="text-xs font-black text-zinc-500">Pricing</p>
          <h1 className="mt-3 text-4xl font-black leading-[1.35]">
            تعرفه‌ها و پلن‌ها
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-zinc-400">
            پلن‌های راستینو برای شروع رایگان، استفاده روزمره و استفاده حرفه‌ای
            طراحی می‌شوند. قیمت‌های نهایی پس از اتصال درگاه پرداخت و آماده‌سازی
            نسخه عمومی اعلام می‌شوند.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`landing-plan-card ${
                plan.highlighted ? "landing-plan-card-active" : ""
              }`}
            >
              <h2 className="text-2xl font-black">{plan.name}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {plan.description}
              </p>

              <p className="mt-6 text-2xl font-black">{plan.price}</p>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <p key={feature} className="text-sm text-zinc-300">
                    ✓ {feature}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-[#242424] bg-[#101010] p-6">
          <h2 className="text-lg font-black">شفافیت تعرفه‌ها</h2>
          <p className="mt-3 text-sm leading-8 text-zinc-400">
            هزینه استفاده از مدل‌های هوش مصنوعی به نوع مدل، تعداد پیام، حجم
            ورودی و خروجی و امکانات فعال بستگی دارد. قبل از تجاری‌سازی نهایی،
            ساختار اعتبار، کیف پول و محدودیت مصرف به‌صورت شفاف نمایش داده می‌شود.
          </p>
        </div>
      </section>
    </main>
  );
}
