import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({
      user: null,
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: currentUser.id,
    },
    include: {
      wallet: true,
    },
  });

  if (!user) {
    return Response.json({
      user: null,
    });
  }

  return Response.json({
    user: {
      id: user.id,
      mobile: user.mobile,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      plan: user.plan,
      balance: user.wallet?.balance || 0,
      createdAt: user.createdAt,
    },
  });
}
