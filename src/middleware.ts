import { NextResponse, type NextRequest } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type Rule = {
  name: string;
  pattern: RegExp;
  limit: number;
  windowMs: number;
};

const globalStore = globalThis as typeof globalThis & {
  __rastinoRateLimit?: Map<string, RateLimitEntry>;
};

const store = globalStore.__rastinoRateLimit || new Map<string, RateLimitEntry>();
globalStore.__rastinoRateLimit = store;

const rules: Rule[] = [
  { name: "otp-request", pattern: /^\/api\/auth\/request-otp/, limit: 5, windowMs: 15 * 60 * 1000 },
  { name: "otp-verify", pattern: /^\/api\/auth\/verify-otp/, limit: 10, windowMs: 15 * 60 * 1000 },
  { name: "chat", pattern: /^\/api\/chats\/[^/]+\/messages/, limit: 45, windowMs: 60 * 1000 },
  { name: "image-generate", pattern: /^\/api\/images\/generate/, limit: 12, windowMs: 60 * 1000 },
  { name: "image-save", pattern: /^\/api\/images\/save-chat/, limit: 30, windowMs: 60 * 1000 },
  { name: "admin", pattern: /^\/api\/admin/, limit: 120, windowMs: 60 * 1000 },
  { name: "api-default", pattern: /^\/api\//, limit: 300, windowMs: 60 * 1000 },
];

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function applyHeaders(response: NextResponse, pathname: string) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  if (
    pathname.startsWith("/app") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api")
  ) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  if (pathname.startsWith("/api")) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
  }

  return response;
}

function checkRateLimit(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const rule = rules.find((item) => item.pattern.test(pathname));

  if (!rule) return null;

  const now = Date.now();
  const ip = getClientIp(req);
  const key = `${rule.name}:${ip}`;
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + rule.windowMs });
    return null;
  }

  current.count += 1;
  store.set(key, current);

  if (current.count <= rule.limit) return null;

  const retryAfter = Math.ceil((current.resetAt - now) / 1000);

  const response = NextResponse.json(
    {
      error: "درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کن.",
      code: "RATE_LIMITED",
      retryAfter,
    },
    { status: 429 }
  );

  response.headers.set("Retry-After", String(retryAfter));
  response.headers.set("X-RateLimit-Limit", String(rule.limit));
  response.headers.set("X-RateLimit-Remaining", "0");

  return applyHeaders(response, pathname);
}

export function middleware(req: NextRequest) {
  const limited = checkRateLimit(req);

  if (limited) return limited;

  return applyHeaders(NextResponse.next(), req.nextUrl.pathname);
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/api/:path*"],
};
