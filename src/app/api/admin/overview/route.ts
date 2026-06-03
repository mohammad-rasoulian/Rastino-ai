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

  const [
    usersCount,
    chatsCount,
    messagesCount,
    imageChatsCount,
    plansCount,
    promptsCount,
    recentUsers,
    recentChats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.chat.count(),
    prisma.message.count(),
    prisma.chat.count({ where: { type: "image" } }),
    prisma.plan.count(),
    prisma.promptTemplate.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        mobile: true,
        email: true,
        role: true,
        plan: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.chat.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
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
        _count: {
          select: {
            messages: true,
          },
        },
      },
    }),
  ]);

  return Response.json({
    overview: {
      usersCount,
      chatsCount,
      messagesCount,
      imageChatsCount,
      plansCount,
      promptsCount,
      recentUsers,
      recentChats,
    },
  });
}
