import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const metadata: Metadata = {
  title: "حریم خصوصی راستینو",
  description:
    "سیاست حریم خصوصی راستینو درباره داده‌های کاربر، چت‌ها، حساب کاربری و امنیت اطلاعات.",
};

export default function PrivacyPage() {
  return (
    <main dir="rtl" className="landing-shell min-h-screen text-zinc-100">
      <section className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <BrandLogo size="sm" />
          <span className="text-lg font-black">راستینو</span>
        </Link>

        <article className="landing-wide-card mt-10">
          <p className="text-xs font-black text-zinc-500">Privacy</p>

          <h1 className="mt-3 text-4xl font-black leading-[1.35]">
            حریم خصوصی
          </h1>

          <div className="mt-8 space-y-7 text-sm leading-8 text-zinc-400">
            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-100">
                ۱. داده‌های حساب کاربری
              </h2>
              <p>
                برای ورود و استفاده از راستینو ممکن است اطلاعاتی مانند شماره
                موبایل، ایمیل، وضعیت حساب، پلن و تاریخچه استفاده ذخیره شود.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-100">
                ۲. محتوای گفتگوها
              </h2>
              <p>
                گفتگوها و خروجی‌ها برای نمایش تاریخچه، بهبود تجربه کاربری و
                مدیریت حساب ذخیره می‌شوند. کاربر نباید اطلاعات بسیار حساس یا محرمانه را بدون بررسی وارد کند.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-100">
                ۳. امنیت اطلاعات
              </h2>
              <p>
                راستینو از کوکی امن، محدودیت درخواست، هدرهای امنیتی و کنترل
                دسترسی برای محافظت اولیه از اطلاعات کاربران استفاده می‌کند.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-100">
                ۴. سرویس‌های شخص ثالث
              </h2>
              <p>
                برای ارائه پاسخ‌های هوش مصنوعی ممکن است درخواست‌ها از طریق
                ارائه‌دهندگان مدل‌های هوش مصنوعی پردازش شوند. جزئیات نهایی پس از اتصال رسمی API اعلام می‌شود.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-zinc-100">
                ۵. به‌روزرسانی سیاست
              </h2>
              <p>
                این سیاست هم‌زمان با توسعه محصول، اتصال پرداخت، پیامک، APIهای
                هوش مصنوعی و امکانات جدید به‌روزرسانی خواهد شد.
              </p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
