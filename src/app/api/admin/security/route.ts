import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json({ error: "دسترسی مدیریت ندارید." }, { status: 403 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [
    sessionsCount,
    expiredSessionsCount,
    inactiveUsersCount,
    otpLastHourCount,
    adminActions,
  ] = await Promise.all([
    prisma.session.count(),
    prisma.session.count({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    }),
    prisma.user.count({
      where: {
        status: {
          not: "active",
        },
      },
    }),
    prisma.otpCode.count({
      where: {
        createdAt: {
          gte: oneHourAgo,
        },
      },
    }),
    prisma.adminAction.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 60,
      include: {
        admin: {
          select: {
            id: true,
            mobile: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return Response.json({
    security: {
      sessionsCount,
      expiredSessionsCount,
      inactiveUsersCount,
      otpLastHourCount,
      adminActions,
    },
  });
}
