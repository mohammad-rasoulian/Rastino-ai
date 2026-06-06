"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 8000
) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}


type AuthUser = {
  id?: string;
  mobile?: string;
  phone?: string;
  displayName?: string;
  name?: string;
  role?: string;
  plan?: string;
};

type AuthGateProps = {
  children: ReactNode;
};

function normalizeMobile(value: string) {
  return value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\s+/g, "");
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <p className="text-sm font-black text-white">{title}</p>
      <p className="mt-2 text-xs leading-6 text-zinc-500">{description}</p>
    </div>
  );
}

function StepCard({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black text-black">
        {index}
      </div>
      <h3 className="text-lg font-black text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-zinc-400">{description}</p>
    </div>
  );
}

function AuthGateView({ children }: AuthGateProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bootRecovered, setBootRecovered] = useState(false);
  void bootRecovered;
  const [isChecking, setIsChecking] = useState(true);
  const [step, setStep] = useState<"identity" | "otp">("identity");

  const [displayName, setDisplayName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const cleanName = useMemo(() => displayName.trim(), [displayName]);
  const cleanMobile = useMemo(() => normalizeMobile(mobile), [mobile]);

  useEffect(() => {
    if (step === "otp") {
      window.setTimeout(() => {
        otpInputRef.current?.focus();
      }, 80);
    }
  }, [step]);

  useEffect(() => {
    const storedName =
      typeof window !== "undefined"
        ? window.localStorage.getItem("rastino_display_name") || ""
        : "";

    setDisplayName(storedName.trim());

    let cancelled = false;

    async function loadUser() {
      try {
        const response = await fetchWithTimeout("/api/auth/me", { credentials: "include", cache: "no-store" }, 8000);

        const data = await response.json().catch(() => null);
        const currentUser = data?.user || data;

        if (!cancelled && response.ok && currentUser?.id) {
          setUser(currentUser);
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      console.warn("[AUTH HARD RECOVERY] Boot took too long; releasing the UI.");
      setBootRecovered(true);
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, []);


  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (cleanName.length < 2) {
      setError("لطفاً اسمی که دوست داری صدات کنیم رو وارد کن.");
      return;
    }

    if (!/^09\d{9}$/.test(cleanMobile)) {
      setError("شماره موبایل رو با فرمت 09xxxxxxxxx وارد کن.");
      return;
    }

    setIsSubmitting(true);

    try {
      window.localStorage.setItem("rastino_display_name", cleanName);

      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          mobile: cleanMobile,
          displayName: cleanName,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "ارسال کد ورود ناموفق بود.");
      }

      setStep("otp");
    } catch (error) {
      setError(error instanceof Error ? error.message : "ارسال کد ورود ناموفق بود.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanOtp = otp.trim();

    if (!/^\d{4,8}$/.test(cleanOtp)) {
      setError("کد ورود رو درست وارد کن.");
      return;
    }

    setIsSubmitting(true);

    try {
      window.localStorage.setItem("rastino_display_name", cleanName || "کاربر");

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          mobile: cleanMobile,
          code: cleanOtp,
          otp: cleanOtp,
          displayName: cleanName,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "کد ورود صحیح نیست.");
      }

      setUser(data?.user || { mobile: cleanMobile, displayName: cleanName });
    } catch (error) {
      setError(error instanceof Error ? error.message : "ورود ناموفق بود.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isChecking) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#050505] text-white">
        <div className="flex min-h-screen items-center justify-center px-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-zinc-400">
            در حال آماده‌سازی راستینو...
          </div>
        </div>
      </main>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <main
      dir="rtl"
      className="relative h-screen snap-y snap-mandatory overflow-y-auto overflow-x-hidden scroll-smooth bg-[#050505] text-white"
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.14),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.08),transparent_30%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="pointer-events-none fixed left-[-12rem] top-24 h-96 w-96 rounded-full bg-white/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-12rem] right-[-12rem] h-[30rem] w-[30rem] rounded-full bg-white/5 blur-[140px]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl snap-start items-center justify-center px-5 py-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_460px]">
          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.025] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(135deg,#fff_1px,transparent_1px)] [background-size:22px_22px]" />
              <div className="absolute -left-24 top-8 h-56 w-56 rounded-full bg-white/10 blur-[90px]" />

              <div className="relative">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-bold text-zinc-300">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  Rastino AI Workspace
                </div>

                <h1 className="mt-8 max-w-2xl text-5xl font-black leading-[1.25] tracking-tight text-white">
                  دستیار هوشمند فارسی
                  <span className="block text-zinc-400">برای نوشتن، تحلیل و ساختن</span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-8 text-zinc-400">
                  راستینو کمک می‌کند متن بنویسی، ایده بگیری، خلاصه‌سازی کنی،
                  کدنویسی را جلو ببری و خروجی آماده‌تری بسازی. ورودت فقط با یک پیامک امن انجام می‌شود.
                </p>

                <div className="mt-10 grid grid-cols-2 gap-4">
                  <FeatureCard
                    title="چت هوشمند"
                    description="مدل مناسب برای سؤال‌های روزمره، تحلیل و کدنویسی."
                  />
                  <FeatureCard
                    title="پلن‌های شفاف"
                    description="رایگان، پلاس و پرو با محدودیت‌های واضح."
                  />
                  <FeatureCard
                    title="ورود امن"
                    description="کد یک‌بارمصرف واقعی با پیامک خدماتی."
                  />
                  <FeatureCard
                    title="تجربه فارسی"
                    description="رابط راست‌چین، ساده و مناسب کاربران ایرانی."
                  />
                </div>

                <div className="mt-8 rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-sm font-black text-white">آماده شروعی؟</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    اسمت رو وارد کن تا راستینو شخصی‌تر باهات شروع کنه.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full rounded-[2rem] border border-white/10 bg-[#0d0d0f]/90 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05]">
                <BrandLogo className="h-9 w-9" />
              </div>

              <h2 className="text-2xl font-black tracking-tight text-white">
                {step === "identity" ? "ورود / ثبت‌نام" : "کد ورود"}
              </h2>

              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {step === "identity"
                  ? "برای شروع، این دو مورد رو کامل کن."
                  : "کد پیامک‌شده رو وارد کن تا وارد راستینو بشی."}
              </p>
            </div>

            {step === "identity" ? (
              <form onSubmit={requestOtp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="display-name" className="block text-right text-sm font-bold text-zinc-200">
                    چی صدات کنم؟
                  </label>
                  <input
                    id="display-name"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        mobileInputRef.current?.focus();
                      }
                    }}
                    placeholder="مثلاً سورنا"
                    autoComplete="given-name"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-right text-base font-medium text-white outline-none transition placeholder:text-zinc-600 focus:border-white/25 focus:bg-white/[0.07]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="mobile" className="block text-right text-sm font-bold text-zinc-200">
                    شمارت چیه؟
                  </label>
                  <input
                    id="mobile"
                    ref={mobileInputRef}
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                    placeholder="09123456789"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-left text-base font-semibold tracking-wide text-white outline-none transition placeholder:text-zinc-600 focus:border-white/25 focus:bg-white/[0.07]"
                  />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-right text-sm leading-6 text-red-200">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-2xl border border-white px-5 text-sm font-black shadow-2xl shadow-white/15 transition hover:bg-zinc-200 active:scale-[0.99] disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  opacity: 1,
                }}
                >
                  {isSubmitting ? "در حال ارسال کد..." : "دریافت کد ورود"}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm leading-7 text-zinc-400">
                  کد ورود به شماره{" "}
                  <span dir="ltr" className="font-bold text-white">
                    {cleanMobile}
                  </span>{" "}
                  ارسال شد.
                </div>

                <div className="space-y-2">
                  <label htmlFor="otp" className="block text-right text-sm font-bold text-zinc-200">
                    کد ورود
                  </label>
                  <input
                    id="otp"
                    ref={otpInputRef}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="کد پیامک‌شده"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    dir="ltr"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-center text-xl font-black tracking-[0.35em] text-white outline-none transition placeholder:text-base placeholder:font-medium placeholder:tracking-normal placeholder:text-zinc-600 focus:border-white/25 focus:bg-white/[0.07]"
                  />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-right text-sm leading-6 text-red-200">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-2xl border border-white px-5 text-sm font-black shadow-2xl shadow-white/15 transition hover:bg-zinc-200 active:scale-[0.99] disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  opacity: 1,
                }}
                >
                  {isSubmitting ? "در حال ورود..." : "ورود به راستینو"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("identity");
                    setOtp("");
                    setError("");
                  }}
                  className="h-12 w-full rounded-2xl border border-white/10 text-sm font-bold text-zinc-300 transition hover:bg-white/[0.04]"
                >
                  ویرایش اسم یا شماره
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl snap-start items-center px-5 py-12">
        <div className="w-full rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-zinc-500">
            کاربردهای راستینو
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black leading-[1.35] text-white md:text-6xl">
            از یک سؤال ساده تا خروجی آماده
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
            راستینو برای این ساخته شده که بین فکر کردن و انجام دادن فاصله کم‌تر شود؛
            چه بخواهی یک متن کوتاه بنویسی، چه یک ایده را تحلیل کنی، چه خروجی قابل ارائه بسازی.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <StepCard
              index="۱"
              title="نوشتن و بازنویسی"
              description="کپشن، متن معرفی، ایمیل، سناریو، پیام رسمی یا محتوای سایت را سریع‌تر آماده کن."
            />
            <StepCard
              index="۲"
              title="تحلیل و خلاصه‌سازی"
              description="متن‌های طولانی، یادداشت‌ها و ایده‌ها را به خلاصه، چک‌لیست و تصمیم قابل اجرا تبدیل کن."
            />
            <StepCard
              index="۳"
              title="کدنویسی و ساخت تصویر"
              description="برای دیباگ، توضیح کد، ایده بصری، پوستر، کاور و تصویرسازی از راستینو کمک بگیر."
            />
          </div>
        </div>
      </section>

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl snap-start items-center px-5 py-12">
        <div className="grid w-full gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2.5rem] border border-white/10 bg-black/35 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-zinc-500">
              تجربه کار
            </p>
            <h2 className="mt-4 text-4xl font-black leading-[1.35] text-white md:text-5xl">
              ساده شروع کن، جدی ادامه بده
            </h2>
            <p className="mt-5 text-sm leading-8 text-zinc-400">
              راستینو قرار نیست پیچیده باشد. وارد می‌شوی، سؤال یا خواسته‌ات را می‌نویسی،
              مدل مناسب انتخاب می‌شود و خروجی را همان‌جا دریافت می‌کنی.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FeatureCard
              title="پلن رایگان برای شروع"
              description="برای آشنایی و استفاده سبک، بدون نیاز به پرداخت."
            />
            <FeatureCard
              title="پلاس برای استفاده روزانه"
              description="پیام بیشتر، امکانات بیشتر و مدل‌های مناسب‌تر برای تولید محتوا."
            />
            <FeatureCard
              title="پرو برای کار جدی‌تر"
              description="برای تحلیل عمیق، پروژه، کدنویسی و نیازهای سنگین‌تر."
            />
            <FeatureCard
              title="رابط فارسی و مینیمال"
              description="بدون شلوغی اضافه؛ تمرکز روی سؤال، پاسخ و خروجی."
            />
          </div>
        </div>
      </section>

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl snap-start items-center justify-center px-5 py-12">
        <div className="w-full rounded-[2.5rem] border border-white/10 bg-white/[0.035] p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl md:p-14">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05]">
            <BrandLogo className="h-10 w-10" />
          </div>

          <h2 className="mx-auto max-w-3xl text-4xl font-black leading-[1.35] text-white md:text-6xl">
            آماده‌ای راستینو رو امتحان کنی؟
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400">
            برگرد به بخش ورود، اسمت و شماره‌ات رو وارد کن و اولین پیامت رو بفرست.
            راستینو برای نوشتن، یادگیری، تحلیل، برنامه‌ریزی و ساخت محتوا کنارته.
          </p>

          <a
            href="#"
            className="mt-8 inline-flex h-14 items-center justify-center rounded-2xl bg-white px-8 text-sm font-black text-black transition hover:bg-zinc-200"
          >
            برگشت به فرم ورود
          </a>
        </div>
      </section>
    </main>
  );
}

export function AuthGate(props: AuthGateProps) {
  return <AuthGateView {...props} />;
}

export default AuthGate;
