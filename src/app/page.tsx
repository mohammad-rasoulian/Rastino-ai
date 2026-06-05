import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { planConfigs, formatToman } from "@/lib/billing/plans";

const features = [
  {
    title: "چت هوشمند برای کارهای مختلف",
    description:
      "از نوشتن و ایده‌پردازی تا تحلیل، ترجمه، برنامه‌ریزی، خلاصه‌سازی و حل مسئله را در یک فضای ساده انجام بده.",
  },
  {
    title: "خلاصه‌سازی و تبدیل محتوا",
    description:
      "متن‌های طولانی، یادداشت‌ها و محتواها را به خلاصه، نکته‌های کلیدی، چک‌لیست یا خروجی قابل استفاده تبدیل کن.",
  },
  {
    title: "تولید تصویر و ایده بصری",
    description:
      "برای پست، پوستر، کاور، ارائه، تبلیغات یا ایده‌های شخصی، تصویر و کانسپت بصری بساز.",
  },
  {
    title: "فضای کاری یکپارچه",
    description:
      "چت‌ها، تصاویر، تاریخچه، تنظیمات و حساب کاربری را در یک پنل مرتب و حرفه‌ای مدیریت کن.",
  },
];

const useCases = [
  "نوشتن متن، کپشن و سناریو",
  "برنامه‌ریزی و ایده‌پردازی",
  "تحلیل و خلاصه‌سازی",
  "کمک آموزشی و یادگیری",
  "کدنویسی و دیباگ",
  "ساخت تصویر و محتوای بصری",
];

const plans = Object.values(planConfigs).map((plan) => ({
  name: plan.nameFa,
  nameEn: plan.nameEn,
  price: plan.priceToman === 0 ? "رایگان" : `${formatToman(plan.priceToman)} تومان / ماه`,
  description: plan.description,
  features: plan.features,
  badge: plan.badge,
  highlighted: plan.id === "plus",
  stats: [
    `${plan.monthlyCredits.toLocaleString("fa-IR")} اعتبار ماهانه`,
    `${plan.dailyMessages.toLocaleString("fa-IR")} پیام روزانه`,
    `${plan.monthlyImages.toLocaleString("fa-IR")} تصویر ماهانه`,
  ],
}));



function EnamadTrustBadge() {
  const exactEnamadHtml = `<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=737558&Code=Fn6EDap5F7RhTzgahabRFO7kymRFCWK5'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=737558&Code=Fn6EDap5F7RhTzgahabRFO7kymRFCWK5' alt='' style='cursor:pointer' code='Fn6EDap5F7RhTzgahabRFO7kymRFCWK5'></a>`;

  return (
    <div className="flex min-h-28 items-center justify-center rounded-3xl border border-white/10 bg-white p-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)] [&_a]:block [&_img]:mx-auto [&_img]:max-h-28 [&_img]:w-auto">
      <div dangerouslySetInnerHTML={{ __html: exactEnamadHtml }} />
    </div>
  );
}

export default function
 LandingPage() {
  return (
    <main dir="rtl" className="landing-shell min-h-screen text-zinc-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo size="sm" />
          <div>
            <p className="text-lg font-black">راستینو</p>
            <p className="text-xs r-muted">دستیار هوشمند فارسی برای کارهای واقعی</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
          <a href="#features" className="hover:text-white">
            امکانات
          </a>
          <a href="#plans" className="hover:text-white">
            پلن‌ها
          </a>
          <a href="#use-cases" className="hover:text-white">
            کاربردها
          </a>
        </nav>

        <Link href="/app" className="landing-login-button">
          ورود به اپلیکیشن
        </Link>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-12 lg:grid-cols-[1.1fr_.9fr] lg:pt-20">
        <div>
          <div className="landing-badge">هوش مصنوعی فارسی، ساده و کاربردی</div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.35] md:text-6xl">
            راستینو کمک می‌کند سریع‌تر بنویسی، بهتر فکر کنی، دقیق‌تر تحلیل کنی و خروجی آماده‌تری بسازی.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-9 text-zinc-400 md:text-lg">
            راستینو فقط یک چت‌بات نیست؛ یک فضای هوشمند برای نوشتن، تحلیل،
            خلاصه‌سازی، ایده‌پردازی، کدنویسی، تولید تصویر و انجام سریع‌تر کارهاست.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/app" className="landing-primary-button">
              شروع رایگان
            </Link>

            <a href="#features" className="landing-secondary-button">
              مشاهده امکانات
            </a>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            <div className="landing-mini-stat">
              <b>چت</b>
              <span>برای سؤال‌ها و کارهای روزمره</span>
            </div>
            <div className="landing-mini-stat">
              <b>تصویر</b>
              <span>برای ایده‌های بصری</span>
            </div>
            <div className="landing-mini-stat">
              <b>ابزار</b>
              <span>برای خروجی سریع‌تر</span>
            </div>
          </div>
        </div>

        <div className="landing-preview-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs r-muted">اپلیکیشن راستینو</p>
              <h2 className="text-xl font-black">فضای کاری هوشمند با AI</h2>
            </div>
            <BrandLogo size="sm" />
          </div>

          <div className="space-y-3">
            <div className="landing-message landing-message-user">
              برای این ایده یک متن معرفی کوتاه، جذاب و حرفه‌ای بنویس.
            </div>

            <div className="landing-message landing-message-ai">
              <p className="font-black">پاسخ راستینو</p>
              <p className="mt-2 text-sm leading-7 text-zinc-300">
                اول مخاطب و هدف را مشخص می‌کنیم، بعد متن را کوتاه، شفاف و
                قابل استفاده برای سایت یا شبکه‌های اجتماعی آماده می‌کنیم.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="landing-tool-card">خلاصه‌سازی</div>
              <div className="landing-tool-card">ایده‌پردازی</div>
              <div className="landing-tool-card">کدنویسی</div>
              <div className="landing-tool-card">تولید تصویر</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-8">
          <p className="text-xs font-black text-zinc-500">امکانات</p>
          <h2 className="mt-2 text-3xl font-black">با راستینو چه کارهایی می‌تونی انجام بدی؟</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="landing-card">
              <h3 className="text-lg font-black">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="use-cases" className="mx-auto max-w-7xl px-5 py-16">
        <div className="landing-wide-card">
          <div>
            <p className="text-xs font-black text-zinc-500">کاربردها</p>
            <h2 className="mt-2 text-3xl font-black">
              برای کار، یادگیری، محتوا و زندگی روزمره
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-zinc-400">
              راستینو برای یک گروه خاص محدود نیست. هر کسی که می‌خواهد سریع‌تر
              فکر کند، بهتر بنویسد، بهتر تحلیل کند یا خروجی آماده‌تری بسازد،
              می‌تواند از راستینو استفاده کند.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((item) => (
              <div key={item} className="landing-tool-card">
                {item}
              </div>
            ))}
          </div>

          <Link href="/app" className="landing-primary-button mt-8 inline-flex">
            شروع کن
          </Link>
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-8">
          <p className="text-xs font-black text-zinc-500">پلن‌ها</p>
          <h2 className="mt-2 text-3xl font-black">پلن‌های ساده، شفاف و قابل انتخاب</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`landing-plan-card ${
                plan.highlighted ? "landing-plan-card-active" : ""
              }`}
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-black">{plan.name}</h3>
                  <p className="mt-1 text-xs font-black text-zinc-500" dir="ltr">
                    {plan.nameEn}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    {plan.description}
                  </p>
                </div>

                <span className="landing-plan-badge">
                  {plan.badge}
                </span>
              </div>

              <p className="mb-2 text-2xl font-black">{plan.price}</p>
              <p className="mb-5 text-xs text-zinc-500">
                قیمت ویژه شروع فعالیت راستینو
              </p>

              <div className="mb-5 grid gap-2">
                {plan.stats.map((stat) => (
                  <div
                    key={stat}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-black text-zinc-200"
                  >
                    {stat}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <p key={feature} className="text-sm text-zinc-300">
                    ✓ {feature}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="landing-final-cta">
          <BrandLogo size="lg" />
          <h2 className="mt-6 text-3xl font-black md:text-4xl">
            آماده‌ای راستینو رو امتحان کنی؟
          </h2>
          <p className="mt-4 max-w-xl text-center text-sm leading-8 text-zinc-400">
            وارد اپلیکیشن شو، اولین پیام رو بفرست و ببین چطور می‌تونی سریع‌تر
            بنویسی، فکر کنی، تحلیل کنی و خروجی بسازی.
          </p>
          <Link href="/app" className="landing-primary-button mt-8">
            ورود به راستینو
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#202020] bg-[#050505] px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.15fr_0.85fr_0.9fr] md:items-start">
          <div>
            <div className="flex items-center gap-3">
              <BrandLogo size="md" />
              <div>
                <p className="text-lg font-black">راستینو</p>
                <p className="mt-1 text-xs text-zinc-500">Rastino AI Platform</p>
              </div>
            </div>

            <p className="mt-5 max-w-xl text-sm leading-8 text-zinc-400">
              راستینو یک فضای هوشمند فارسی برای چت، تولید محتوا، ایده‌پردازی،
              کدنویسی، تحلیل و تولید تصویر است؛ ساخته شده برای استفاده واقعی،
              روزمره و حرفه‌ای.
            </p>

            <p className="mt-5 text-xs text-zinc-600">
              © {new Date().getFullYear()} Rastino. All rights reserved.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-black text-white">اعتماد به ما</p>
            <p className="mt-3 text-xs leading-6 text-zinc-500">
              راستینو با هدف ارائه تجربه‌ای امن، شفاف و قابل اعتماد برای کاربران
              فارسی‌زبان توسعه داده شده است.
            </p>

            <div className="mt-5 grid gap-2 text-xs text-zinc-300">
              <span className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                ✓ نماد اعتماد الکترونیکی
              </span>
              <span className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                ✓ دسترسی امن و رمزنگاری‌شده
              </span>
              <span className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                ✓ پشتیبانی و پیگیری کاربران
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white">نماد اعتماد</p>
                <p className="mt-1 text-xs text-zinc-500">
                  برای مشاهده جزئیات روی نماد کلیک کنید.
                </p>
              </div>
            </div>

            <EnamadTrustBadge />
          </div>
        </div>
      </footer>
    
      <section className="relative mx-auto w-full max-w-7xl px-6 py-20" id="why-rastino">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-zinc-500">
              چرا راستینو؟
            </p>

            <h2 className="mt-4 text-3xl font-black leading-[1.4] tracking-tight text-white md:text-5xl">
              یک فضای ساده برای کار جدی با هوش مصنوعی
            </h2>

            <p className="mt-5 text-base leading-8 text-zinc-400">
              راستینو کمک می‌کند از هوش مصنوعی فقط برای چت کردن استفاده نکنی؛
              بلکه سریع‌تر فکر کنی، بهتر بنویسی، دقیق‌تر تحلیل کنی و خروجی آماده‌تری بسازی.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black text-black">
                ۱
              </div>
              <h3 className="text-lg font-black text-white">سریع‌تر فکر کن</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                سؤال، ایده یا مسئله‌ات را وارد کن و سریع به مسیر درست، پیشنهاد عملی و پاسخ قابل استفاده برس.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black text-black">
                ۲
              </div>
              <h3 className="text-lg font-black text-white">بهتر بنویس</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                متن معرفی، کپشن، ایمیل، سناریو، خلاصه یا محتوای سایت را با لحن حرفه‌ای‌تر آماده کن.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black text-black">
                ۳
              </div>
              <h3 className="text-lg font-black text-white">خروجی آماده بساز</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                از تحلیل و برنامه‌ریزی تا کدنویسی و تولید تصویر، همه چیز را در یک محیط منظم جلو ببر.
              </p>
            </div>
          </div>
        </div>
      </section>

</main>
  );
}
