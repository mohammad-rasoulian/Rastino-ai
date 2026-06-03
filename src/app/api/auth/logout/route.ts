import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "rastino_session";

function noStoreJson(data: unknown, init?: ResponseInit) {
  const response = Response.json(data, init);

  response.headers.set("Cache-Control", "no-store, max-age=0");

  return response;
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await prisma.session.deleteMany({
        where: {
          token,
        },
      });
    }

    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return noStoreJson({ ok: true });
  } catch (error) {
    console.error("[LOGOUT ERROR]", error);

    return noStoreJson(
      { error: "خروج ناموفق بود. دوباره تلاش کن." },
      { status: 500 }
    );
  }
}
