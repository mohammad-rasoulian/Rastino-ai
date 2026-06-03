import { prisma } from "@/lib/prisma";
import {
  getRequestUser,
  isUnauthorizedError,
  unauthorizedResponse,
} from "@/lib/auth/request-user";

export async function GET() {
  try {
    const user = await getRequestUser();

    const chats = await prisma.chat.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json({ chats });
  } catch (error) {
    if (isUnauthorizedError(error)) return unauthorizedResponse();

    console.error("[CHATS GET ERROR]", error);

    return Response.json(
      { error: "دریافت چت‌ها ناموفق بود." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getRequestUser();
    const body = await req.json().catch(() => ({}));

    const title = String(body.title || "چت جدید").trim() || "چت جدید";
    const type = body.type === "image" ? "image" : "chat";

    const chat = await prisma.chat.create({
      data: {
        userId: user.id,
        title,
        type,
      },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json({ chat });
  } catch (error) {
    if (isUnauthorizedError(error)) return unauthorizedResponse();

    console.error("[CHATS POST ERROR]", error);

    return Response.json(
      { error: "ساخت چت ناموفق بود." },
      { status: 500 }
    );
  }
}
