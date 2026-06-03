import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const metadata: Metadata = {
  title: "قوانین و مقررات راستینو",
  description:
    "قوانین استفاده از خدمات راستینو، مسئولیت کاربران و شرایط استفاده از دستیار هوشمند.",
};

export default function TermsPage() {
  return (
    <main dir="rtl" className="landing-shell min-h-screen text-zinc-100">
      <section className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <BrandLogo size="sm" />
          <span className="text-lg font-black">راستینو</span>
        </Link>

        <article className="landing-wide-card mt-10">
          <p className="text-xs font-black text-zinc-500">Terms</p>

          <h1 className="mt-3 text-4xl font-black leading-[1.35]">
            قوانین و مقررات استفاده
          </h1>

          <div className="mt-8 space-y-7 text-sm leading-8 text-zinc-400">
            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-100">
                ۱. پذیرش قوانین
              </h2>
              <p>
                استفاده از راستینو به معنی پذیرش قوانین و شرایط استفاده از این
                سرویس است. این قوانین ممکن است هم‌زمان با توسعه محصول به‌روزرسانی شوند.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-100">
                ۲. مسئولیت محتوای تولیدشده
              </h2>
              <p>
                پاسخ‌های هوش مصنوعی ممکن است خطا داشته باشند. کاربران باید قبل
                از استفاده مهم، رسمی، مالی، پزشکی، حقوقی یا تخصصی، خروجی‌ها را بررسی کنند.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-100">
                ۳. استفاده مجاز
              </h2>
              <p>
                استفاده از راستینو برای فعالیت‌های غیرقانونی، آسیب‌زننده،
                نقض حریم خصوصی، تولید محتوای مخرب یا سوءاستفاده از سرویس مجاز نیست.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-100">
                ۴. حساب کاربری
              </h2>
              <p>
                کاربر مسئول حفظ دسترسی به حساب خود است. در صورت مشاهده رفتار
                مشکوک، سوءاستفاده یا نقض قوانین، امکان محدودسازی یا غیرفعال‌سازی حساب وجود دارد.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-100">
                ۵. تغییرات سرویس
              </h2>
              <p>
                امکانات، مدل‌ها، تعرفه‌ها و محدودیت‌های سرویس ممکن است با توجه
                به شرایط فنی، هزینه زیرساخت و سیاست‌های محصول تغییر کنند.
              </p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
