import { prisma } from "@/lib/prisma";
import { createOtpCode, hashOtp, normalizeIranMobile } from "@/lib/auth/auth-utils";
import { sendOtpSms } from "@/lib/auth/sms";

const OTP_TTL_MINUTES = 5;
const MAX_REQUESTS_PER_HOUR = 5;

function noStoreJson(data: unknown, init?: ResponseInit) {
  const response = Response.json(data, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const mobile = normalizeIranMobile(String(body.mobile || ""));

    if (!mobile) {
      return noStoreJson(
        { error: "شماره موبایل معتبر نیست." },
        { status: 400 }
      );
    }

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [recentCount, hourlyCount] = await Promise.all([
      prisma.otpCode.count({
        where: {
          mobile,
          createdAt: { gte: oneMinuteAgo },
        },
      }),
      prisma.otpCode.count({
        where: {
          mobile,
          createdAt: { gte: oneHourAgo },
        },
      }),
    ]);

    if (recentCount > 0) {
      return noStoreJson(
        {
          error: "کد قبلاً ارسال شده است. لطفاً یک دقیقه بعد دوباره تلاش کن.",
          code: "OTP_RATE_LIMIT_MINUTE",
        },
        { status: 429 }
      );
    }

    if (hourlyCount >= MAX_REQUESTS_PER_HOUR) {
      return noStoreJson(
        {
          error: "تعداد درخواست کد زیاد است. لطفاً کمی بعد دوباره تلاش کن.",
          code: "OTP_RATE_LIMIT_HOUR",
        },
        { status: 429 }
      );
    }

    const generatedCode = createOtpCode();
    const smsResult = await sendOtpSms(mobile, generatedCode);

    if (!smsResult.ok) {
      return noStoreJson(
        { error: smsResult.error || "ارسال پیامک ناموفق بود." },
        { status: 500 }
      );
    }

    const codeToStore = smsResult.code || generatedCode;
    const existingUser = await prisma.user.findUnique({
      where: { mobile },
      select: { id: true },
    });

    await prisma.otpCode.create({
      data: {
        mobile,
        codeHash: hashOtp(mobile, codeToStore),
        expiresAt: new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000),
        userId: existingUser?.id,
      },
    });

    return noStoreJson({
      ok: true,
      message: "کد ورود ارسال شد.",
      expiresInSeconds: OTP_TTL_MINUTES * 60,
    });
  } catch (error) {
    console.error("[REQUEST OTP ERROR]", error);

    return noStoreJson(
      { error: "ارسال کد ورود ناموفق بود. کمی بعد دوباره تلاش کن." },
      { status: 500 }
    );
  }
}
