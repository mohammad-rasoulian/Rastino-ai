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

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      mobile: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      status: true,
      createdAt: true,
      wallet: {
        select: {
          balance: true,
          currency: true,
        },
      },
      _count: {
        select: {
          chats: true,
          messages: true,
          usageLogs: true,
        },
      },
    },
  });

  return Response.json({ users });
}
