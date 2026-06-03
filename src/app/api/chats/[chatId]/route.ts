import { prisma } from "@/lib/prisma";
import {
  getRequestUser,
  isUnauthorizedError,
  unauthorizedResponse,
} from "@/lib/auth/request-user";

type RouteContext = {
  params: Promise<{
    chatId: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const user = await getRequestUser();
    const { chatId } = await context.params;

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!chat) {
      return Response.json(
        { error: "چت پیدا نشد." },
        { status: 404 }
      );
    }

    return Response.json({ chat });
  } catch (error) {
    if (isUnauthorizedError(error)) return unauthorizedResponse();

    console.error("[CHAT GET ERROR]", error);

    return Response.json(
      { error: "دریافت چت ناموفق بود." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await getRequestUser();
    const { chatId } = await context.params;

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!chat) {
      return Response.json(
        { error: "چت پیدا نشد." },
        { status: 404 }
      );
    }

    await prisma.chat.delete({
      where: {
        id: chat.id,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (isUnauthorizedError(error)) return unauthorizedResponse();

    console.error("[CHAT DELETE ERROR]", error);

    return Response.json(
      { error: "حذف چت ناموفق بود." },
      { status: 500 }
    );
  }
}
