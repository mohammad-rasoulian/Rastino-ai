import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const metadata: Metadata = {
  title: "تماس با راستینو",
  description:
    "راه‌های ارتباط با تیم راستینو برای پشتیبانی، همکاری، گزارش مشکل و پیشنهادها.",
};

export default function ContactPage() {
  return (
    <main dir="rtl" className="landing-shell min-h-screen text-zinc-100">
      <section className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <BrandLogo size="sm" />
          <span className="text-lg font-black">راستینو</span>
        </Link>

        <div className="landing-wide-card mt-10">
          <p className="text-xs font-black text-zinc-500">Contact</p>

          <h1 className="mt-3 text-4xl font-black leading-[1.35]">
            تماس با ما
          </h1>

          <p className="mt-6 text-base leading-9 text-zinc-400">
            برای پشتیبانی، همکاری، گزارش خطا یا ارسال پیشنهاد می‌توانید از
            مسیرهای ارتباطی راستینو استفاده کنید. اطلاعات رسمی تماس پس از اتصال
            دامنه، ایمیل سازمانی و آماده‌سازی نسخه عمومی در همین صفحه قرار می‌گیرد.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <article className="landing-card">
              <h2 className="text-lg font-black">پشتیبانی کاربران</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                ایمیل پشتیبانی پس از راه‌اندازی دامنه رسمی در این بخش درج می‌شود.
              </p>
              <p className="mt-4 rounded-2xl border border-[#242424] bg-[#111] px-4 py-3 text-sm text-zinc-300">
                support@your-domain.ir
              </p>
            </article>

            <article className="landing-card">
              <h2 className="text-lg font-black">همکاری و پیشنهادها</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                برای همکاری، پیشنهاد محصول یا گزارش مشکل، مسیر ارتباطی رسمی به‌زودی فعال می‌شود.
              </p>
              <p className="mt-4 rounded-2xl border border-[#242424] bg-[#111] px-4 py-3 text-sm text-zinc-300">
                business@your-domain.ir
              </p>
            </article>
          </div>

          <p className="mt-8 text-xs leading-7 text-zinc-500">
            نکته: قبل از ارسال برای اینماد یا درگاه بانکی، ایمیل، شماره تماس،
            آدرس و اطلاعات مالکیت باید با اطلاعات واقعی کسب‌وکار جایگزین شوند.
          </p>

          <div className="mt-10">
            <Link href="/" className="landing-secondary-button">
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
