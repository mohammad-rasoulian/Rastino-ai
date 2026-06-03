import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json(
      { error: "دسترسی مدیریت ندارید." },
      { status: 403 }
    );
  }

  const chats = await prisma.chat.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          mobile: true,
          email: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 6,
        select: {
          id: true,
          role: true,
          content: true,
          model: true,
          totalTokens: true,
          costUsd: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  return Response.json({ chats });
}
