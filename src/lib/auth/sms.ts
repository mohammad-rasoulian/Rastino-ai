import { sendMelipayamakOtp } from "@/lib/sms/melipayamak";

export type SendOtpSmsResult =
  | {
      ok: true;
      provider: "mock" | "melipayamak";
      code?: string;
      recId?: string;
    }
  | {
      ok: false;
      provider: "mock" | "melipayamak";
      error: string;
    };

function shouldUseMockOtp() {
  return (
    process.env.OTP_MOCK_MODE === "true" ||
    process.env.SMS_PROVIDER !== "melipayamak"
  );
}

export async function sendOtpSms(
  mobile: string,
  code: string
): Promise<SendOtpSmsResult> {
  if (shouldUseMockOtp()) {
    console.log(`[RASTINO OTP MOCK] ${new Date().toISOString()} ${mobile}: ${code}`);

    return {
      ok: true,
      provider: "mock",
      code,
    };
  }

  try {
    const result = await sendMelipayamakOtp({ mobile, code });

    console.log("[MELIPAYAMAK OTP SENT]", {
      mobile,
      recId: result.recId,
    });

    return {
      ok: true,
      provider: "melipayamak",
      recId: result.recId,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ارسال پیامک ناموفق بود.";

    console.error("[MELIPAYAMAK OTP ERROR]", {
      mobile,
      error: message,
    });

    return {
      ok: false,
      provider: "melipayamak",
      error: message,
    };
  }
}
