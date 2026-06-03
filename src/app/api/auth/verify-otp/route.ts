import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  hashOtp,
  normalizeIranMobile,
} from "@/lib/auth/auth-utils";

const SESSION_COOKIE_NAME = "rastino_session";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

function noStoreJson(data: unknown, init?: ResponseInit) {
  const response = Response.json(data, init);

  response.headers.set("Cache-Control", "no-store, max-age=0");

  return response;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const mobile = normalizeIranMobile(String(body.mobile || ""));
    const code = String(body.code || "").trim();

    if (!mobile || !/^\d{5}$/.test(code)) {
      return noStoreJson(
        { error: "شماره موبایل یا کد معتبر نیست." },
        { status: 400 }
      );
    }

    const otp = await prisma.otpCode.findFirst({
      where: {
        mobile,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otp || otp.codeHash !== hashOtp(mobile, code)) {
      return noStoreJson(
        { error: "کد وارد شده اشتباه یا منقضی شده است." },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { mobile },
      update: {
        status: "active",
      },
      create: {
        mobile,
        status: "active",
        wallet: {
          create: {
            balance: 0,
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    await prisma.$transaction([
      prisma.otpCode.update({
        where: { id: otp.id },
        data: { used: true },
      }),
      prisma.otpCode.updateMany({
        where: {
          mobile,
          used: false,
        },
        data: {
          used: true,
        },
      }),
      prisma.session.deleteMany({
        where: {
          OR: [
            { userId: user.id },
            {
              expiresAt: {
                lt: new Date(),
              },
            },
          ],
        },
      }),
    ]);

    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return noStoreJson({
      ok: true,
      user: {
        id: user.id,
        mobile: user.mobile,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        plan: user.plan,
        balance: user.wallet?.balance || 0,
      },
    });
  } catch (error) {
    console.error("[VERIFY OTP ERROR]", error);

    return noStoreJson(
      { error: "ورود ناموفق بود. کمی بعد دوباره تلاش کن." },
      { status: 500 }
    );
  }
}
