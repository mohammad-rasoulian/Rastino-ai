import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { PlanPurchaseButton } from "@/components/pricing/PlanPurchaseButton";
import { formatToman, planConfigs } from "@/lib/billing/plans";

export const metadata = {
  title: "تعرفه‌ها و پلن‌های راستینو | راستینو",
  description:
    "پلن‌های راستینو برای استفاده رایگان، روزمره و حرفه‌ای با پرداخت امن آنلاین.",
};

const plans = Object.values(planConfigs);

export default async function PricingPage({
  searchParams,
}: {
  searchParams?: Promise<{
    payment?: string;
    plan?: string;
    reason?: string;
  }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const paymentStatus = resolvedSearchParams?.payment;

  return (
    <main dir="rtl" className="landing-shell min-h-screen text-zinc-100">
      <section className="mx-auto max-w-7xl px-5 py-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <BrandLogo size="sm" />
          <span className="text-lg font-black">راستینو</span>
        </Link>

        <div className="mt-10">
          <p className="text-xs font-black text-zinc-500">Pricing</p>
          <h1 className="mt-3 text-4xl font-black leading-[1.35]">
            پلن‌های راستینو
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-zinc-400">
            از استفاده رایگان شروع کن؛ هر وقت به سقف بالاتر، مدل‌های بهتر،
            تصویر بیشتر و امکانات حرفه‌ای‌تر نیاز داشتی، پلن مناسب خودت را
            فعال کن.
          </p>
        </div>

        {paymentStatus === "success" && (
          <div className="mt-8 rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-5 text-sm leading-7 text-emerald-100">
            پرداخت با موفقیت تأیید شد و پلن حساب شما فعال شد.
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="mt-8 rounded-[2rem] border border-red-400/20 bg-red-500/10 p-5 text-sm leading-7 text-red-100">
            پرداخت ناموفق بود یا توسط کاربر لغو شد. در صورت کسر وجه، وضعیت
            تراکنش توسط درگاه بررسی و طبق روال بانکی تعیین می‌شود.
          </div>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const highlighted = plan.id === "plus";

            return (
              <article
                key={plan.id}
                className={`landing-plan-card ${
                  highlighted ? "landing-plan-card-active" : ""
                }`}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">{plan.nameFa}</h2>
                    <p
                      className="mt-1 text-xs font-black text-zinc-500"
                      dir="ltr"
                    >
                      {plan.nameEn}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                      {plan.description}
                    </p>
                  </div>

                  <span className="landing-plan-badge">{plan.badge}</span>
                </div>

                <p className="mb-2 text-2xl font-black">
                  {formatToman(plan.priceToman)}
                </p>

                {plan.priceToman > 0 && (
                  <p className="mb-5 text-xs text-zinc-500">
                    پرداخت امن آنلاین از طریق زیبال
                  </p>
                )}

                <div className="mb-5 grid gap-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-black text-zinc-200">
                    {plan.monthlyCredits.toLocaleString("fa-IR")} اعتبار ماهانه
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-black text-zinc-200">
                    {plan.dailyMessages.toLocaleString("fa-IR")} پیام روزانه
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-black text-zinc-200">
                    {plan.monthlyImages.toLocaleString("fa-IR")} تصویر ماهانه
                  </div>
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <p key={feature} className="text-sm text-zinc-300">
                      ✓ {feature}
                    </p>
                  ))}
                </div>

                <PlanPurchaseButton
                  planId={plan.id}
                  priceToman={plan.priceToman}
                />
              </article>
            );
          })}
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-black">پرداخت امن</p>
          <p className="mt-3 text-xs leading-7 text-zinc-500">
            پرداخت پلن‌های راستینو از طریق درگاه زیبال انجام می‌شود. پس از
            بازگشت از درگاه، پرداخت در سرور راستینو تأیید می‌شود و سپس پلن حساب
            فعال خواهد شد.
          </p>
        </div>
      </section>
    </main>
  );
}
