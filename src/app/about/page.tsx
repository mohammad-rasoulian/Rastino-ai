import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const metadata: Metadata = {
  title: "درباره راستینو",
  description:
    "راستینو یک دستیار هوشمند فارسی برای چت، نوشتن، تحلیل، کدنویسی و تولید تصویر است.",
};

export default function AboutPage() {
  return (
    <main dir="rtl" className="landing-shell min-h-screen text-zinc-100">
      <section className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <BrandLogo size="sm" />
          <span className="text-lg font-black">راستینو</span>
        </Link>

        <div className="landing-wide-card mt-10">
          <p className="text-xs font-black text-zinc-500">About Rastino</p>

          <h1 className="mt-3 text-4xl font-black leading-[1.35]">
            درباره راستینو
          </h1>

          <p className="mt-6 text-base leading-9 text-zinc-400">
            راستینو یک دستیار هوشمند فارسی است که برای استفاده روزمره، کار،
            یادگیری، تولید محتوا، تحلیل متن، برنامه‌ریزی، کدنویسی و تولید
            تصویر طراحی شده است. هدف راستینو این است که استفاده از هوش مصنوعی
            برای کاربران فارسی‌زبان ساده‌تر، سریع‌تر و قابل اعتمادتر شود.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="landing-card">
              <h2 className="text-lg font-black">سادگی</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                کاربر بدون پیچیدگی فنی می‌تواند با ابزارهای هوش مصنوعی کار کند.
              </p>
            </article>

            <article className="landing-card">
              <h2 className="text-lg font-black">کاربردی بودن</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                راستینو برای خروجی واقعی ساخته می‌شود؛ نه فقط گفت‌وگوی ساده.
              </p>
            </article>

            <article className="landing-card">
              <h2 className="text-lg font-black">فارسی و بومی</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                تجربه کاربری، متن‌ها و مسیر محصول برای کاربران فارسی‌زبان طراحی شده‌اند.
              </p>
            </article>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/app" className="landing-primary-button">
              ورود به اپلیکیشن
            </Link>

            <Link href="/contact" className="landing-secondary-button">
              تماس با ما
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
