import crypto from "crypto";

export function normalizeIranMobile(input: string) {
  const raw = input.trim().replace(/\s/g, "");

  if (/^09\d{9}$/.test(raw)) return raw;
  if (/^\+989\d{9}$/.test(raw)) return `0${raw.slice(3)}`;
  if (/^989\d{9}$/.test(raw)) return `0${raw.slice(2)}`;

  return null;
}

export function createOtpCode() {
  return String(crypto.randomInt(10000, 100000));
}

function getOtpHashSecret() {
  const secret = process.env.OTP_HASH_SECRET;

  if (!secret || secret.trim().length < 24) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("OTP_HASH_SECRET must be set and at least 24 characters in production");
    }

    return "rastino-local-dev-secret-change-me";
  }

  return secret;
}

export function hashOtp(mobile: string, code: string) {
  return crypto
    .createHmac("sha256", getOtpHashSecret())
    .update(`${mobile}:${code}`)
    .digest("hex");
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}
