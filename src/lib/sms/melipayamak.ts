type SendOtpArgs = {
  mobile: string;
  code: string;
};

const MELIPAYAMAK_SOAP_URL = "http://api.payamak-panel.com/post/send.asmx";

const MELIPAYAMAK_ERRORS: Record<string, string> = {
  "-110": "ملی‌پیامک: باید ApiKey را به جای رمز عبور وارد کنید.",
  "-109": "ملی‌پیامک: باید IP مجاز API را در پنل تنظیم کنید.",
  "-108": "ملی‌پیامک: IP به دلیل تلاش ناموفق مسدود شده است.",
  "-10": "ملی‌پیامک: در متغیرهای ارسالی لینک وجود دارد.",
  "-7": "ملی‌پیامک: خطا در شماره فرستنده.",
  "-6": "ملی‌پیامک: خطای داخلی سامانه.",
  "-5": "ملی‌پیامک: متغیرهای ارسالی با متن پیشفرض همخوانی ندارد.",
  "-4": "ملی‌پیامک: کد متن صحیح نیست یا تایید نشده است.",
  "-3": "ملی‌پیامک: خط ارسالی در سیستم تعریف نشده است.",
  "-2": "ملی‌پیامک: در هر ارسال فقط یک شماره مجاز است.",
  "-1": "ملی‌پیامک: دسترسی وب‌سرویس غیرفعال است.",
  "0": "ملی‌پیامک: نام کاربری یا رمز عبور صحیح نیست.",
  "2": "ملی‌پیامک: اعتبار کافی نیست.",
  "6": "ملی‌پیامک: سامانه در حال بروزرسانی است.",
  "7": "ملی‌پیامک: متن حاوی کلمه فیلتر شده است.",
  "10": "ملی‌پیامک: کاربر فعال نیست.",
  "11": "ملی‌پیامک: ارسال نشده.",
  "12": "ملی‌پیامک: مدارک کاربر کامل نیست.",
  "16": "ملی‌پیامک: شماره گیرنده یافت نشد.",
  "17": "ملی‌پیامک: متن پیامک خالی است.",
  "18": "ملی‌پیامک: شماره گیرنده نامعتبر است.",
  "19": "ملی‌پیامک: از محدودیت ساعتی فراتر رفته‌اید.",
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function extractSoapResult(xml: string) {
  const match = xml.match(/<SendByBaseNumberResult>([\s\S]*?)<\/SendByBaseNumberResult>/);
  return match?.[1]?.trim() || "";
}

function isSuccessfulRecId(value: string) {
  return /^\d{15,}$/.test(value);
}

export async function sendMelipayamakOtp({ mobile, code }: SendOtpArgs) {
  const username = process.env.MELIPAYAMAK_USERNAME || "";
  const password = process.env.MELIPAYAMAK_PASSWORD || "";
  const bodyId = Number(process.env.MELIPAYAMAK_BODY_ID || "465206");

  if (!username || !password || !bodyId) {
    throw new Error("تنظیمات ملی‌پیامک کامل نیست.");
  }

  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <SendByBaseNumber xmlns="http://tempuri.org/">
      <username>${escapeXml(username)}</username>
      <password>${escapeXml(password)}</password>
      <text>
        <string>${escapeXml(code)}</string>
      </text>
      <to>${escapeXml(mobile)}</to>
      <bodyId>${bodyId}</bodyId>
    </SendByBaseNumber>
  </soap:Body>
</soap:Envelope>`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(MELIPAYAMAK_SOAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "http://tempuri.org/SendByBaseNumber",
      },
      body: soapBody,
      signal: controller.signal,
    });

    const xml = await response.text();
    const result = extractSoapResult(xml);

    if (!response.ok) {
      throw new Error(`ملی‌پیامک HTTP ${response.status}`);
    }

    if (!isSuccessfulRecId(result)) {
      throw new Error(MELIPAYAMAK_ERRORS[result] || `خطای ناشناخته ملی‌پیامک: ${result}`);
    }

    return {
      ok: true,
      recId: result,
    };
  } finally {
    clearTimeout(timeout);
  }
}
