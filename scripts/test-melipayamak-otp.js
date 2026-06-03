/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");

function loadEnv() {
  const raw = fs.readFileSync(".env", "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=["']?(.*?)["']?$/);
    if (match) process.env[match[1]] = match[2];
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function extractSoapResult(xml) {
  const match = xml.match(/<SendByBaseNumberResult>([\s\S]*?)<\/SendByBaseNumberResult>/);
  return match?.[1]?.trim() || "";
}

const errors = {
  "-110": "الزام استفاده از ApiKey به جای رمز عبور",
  "-109": "الزام تنظیم IP مجاز برای استفاده از API",
  "-108": "IP مسدود شده است",
  "-10": "در متغیرها لینک وجود دارد",
  "-5": "متغیرها با متن پیشفرض همخوانی ندارد",
  "-4": "کد متن صحیح نیست یا تأیید نشده است",
  "-1": "دسترسی وب‌سرویس غیرفعال است",
  "0": "نام کاربری یا رمز عبور صحیح نیست",
  "2": "اعتبار کافی نیست",
  "18": "شماره گیرنده نامعتبر است",
  "19": "از محدودیت ساعتی فراتر رفته‌اید",
};

async function main() {
  loadEnv();

  const to = process.argv[2];
  const code = process.argv[3] || String(Math.floor(10000 + Math.random() * 90000));

  if (!to) {
    console.error("Usage: node scripts/test-melipayamak-otp.js 09xxxxxxxxx [code]");
    process.exit(1);
  }

  const username = process.env.MELIPAYAMAK_USERNAME;
  const password = process.env.MELIPAYAMAK_PASSWORD;
  const bodyId = Number(process.env.MELIPAYAMAK_BODY_ID || "465206");

  if (!username || !password) {
    console.error("MELIPAYAMAK_USERNAME/PASSWORD missing in .env");
    process.exit(1);
  }

  const body = `<?xml version="1.0" encoding="utf-8"?>
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
      <to>${escapeXml(to)}</to>
      <bodyId>${bodyId}</bodyId>
    </SendByBaseNumber>
  </soap:Body>
</soap:Envelope>`;

  console.log("Sending OTP test:", { to, code, bodyId });

  const res = await fetch("http://api.payamak-panel.com/post/send.asmx", {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "http://tempuri.org/SendByBaseNumber",
    },
    body,
  });

  const xml = await res.text();
  const result = extractSoapResult(xml);

  console.log("HTTP:", res.status);
  console.log("Result:", result);

  if (/^\d{15,}$/.test(result)) {
    console.log("✅ SMS sent successfully. recId:", result);
    return;
  }

  console.log("❌ SMS failed:", errors[result] || result);
  console.log(xml.slice(0, 1000));
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
