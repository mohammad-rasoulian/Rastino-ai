import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

const allowedRoles = ["user", "admin"];
const allowedStatuses = ["active", "inactive", "blocked", "suspended"];

export async function PATCH(req: Request, context: RouteContext) {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json({ error: "دسترسی مدیریت ندارید." }, { status: 403 });
  }

  const { userId } = await context.params;
  const body = await req.json().catch(() => ({}));

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!currentUser) {
    return Response.json({ error: "کاربر پیدا نشد." }, { status: 404 });
  }

  const data: {
    role?: string;
    status?: string;
    plan?: string;
    name?: string | null;
  } = {};

  if (typeof body.role === "string") {
    if (!allowedRoles.includes(body.role)) {
      return Response.json({ error: "نقش معتبر نیست." }, { status: 400 });
    }

    data.role = body.role;
  }

  if (typeof body.status === "string") {
    if (!allowedStatuses.includes(body.status)) {
      return Response.json({ error: "وضعیت معتبر نیست." }, { status: 400 });
    }

    data.status = body.status;
  }

  if (typeof body.plan === "string") {
    const plan = await prisma.plan.findUnique({
      where: { key: body.plan },
    });

    if (!plan) {
      return Response.json({ error: "پلن معتبر نیست." }, { status: 400 });
    }

    data.plan = body.plan;
  }

  if (typeof body.name === "string") {
    data.name = body.name.trim() || null;
  }

  if (userId === admin.id) {
    if (data.role && data.role !== "admin") {
      return Response.json(
        { error: "نمی‌توانی نقش مدیریت خودت را حذف کنی." },
        { status: 400 }
      );
    }

    if (data.status && data.status !== "active") {
      return Response.json(
        { error: "نمی‌توانی حساب مدیریت خودت را غیرفعال کنی." },
        { status: 400 }
      );
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
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

  if (data.status && data.status !== "active") {
    await prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  }

  await prisma.adminAction.create({
    data: {
      adminId: admin.id,
      action: "user.update",
      targetType: "User",
      targetId: userId,
      description: `کاربر ${currentUser.mobile || currentUser.email || userId} ویرایش شد.`,
      metadata: JSON.stringify({
        before: {
          role: currentUser.role,
          plan: currentUser.plan,
          status: currentUser.status,
        },
        after: {
          role: updatedUser.role,
          plan: updatedUser.plan,
          status: updatedUser.status,
        },
      }),
    },
  });

  return Response.json({ ok: true, user: updatedUser });
}
