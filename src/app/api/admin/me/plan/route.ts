import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { normalizePlan } from "@/lib/ai/model-catalog";

export async function PATCH(req: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json({ error: "دسترسی مدیریت ندارید." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = normalizePlan(String(body.plan || "free"));

  const user = await prisma.user.update({
    where: {
      id: admin.id,
    },
    data: {
      plan,
    },
    select: {
      id: true,
      mobile: true,
      email: true,
      role: true,
      plan: true,
      status: true,
    },
  });

  await prisma.adminAction.create({
    data: {
      adminId: admin.id,
      action: "admin.self.plan.switch",
      targetType: "User",
      targetId: admin.id,
      description: `ادمین پلن خودش را برای تست به ${plan} تغییر داد.`,
      metadata: JSON.stringify({
        plan,
      }),
    },
  });

  return Response.json({
    ok: true,
    user,
  });
}
