import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

function toBoolean(value: unknown) {
  return value === true || value === "true" || value === "on";
}

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json({ error: "دسترسی مدیریت ندارید." }, { status: 403 });
  }

  const plans = await prisma.plan.findMany({
    orderBy: [{ priority: "asc" }, { price: "asc" }],
  });

  return Response.json({ plans });
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json({ error: "دسترسی مدیریت ندارید." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "").trim();

  if (!id) {
    return Response.json(
      { error: "شناسه پلن ارسال نشده است." },
      { status: 400 }
    );
  }

  const currentPlan = await prisma.plan.findUnique({
    where: { id },
  });

  if (!currentPlan) {
    return Response.json(
      { error: "پلن پیدا نشد." },
      { status: 404 }
    );
  }

  const plan = await prisma.plan.update({
    where: { id },
    data: {
      name: String(body.name || currentPlan.name).trim() || currentPlan.name,
      description:
        body.description === undefined ? currentPlan.description : String(body.description || ""),
      price: Math.max(0, toNumber(body.price, currentPlan.price)),
      monthlyMessages: Math.max(0, toNumber(body.monthlyMessages, currentPlan.monthlyMessages)),
      dailyMessages: Math.max(0, toNumber(body.dailyMessages, currentPlan.dailyMessages)),
      maxInputTokens: Math.max(0, toNumber(body.maxInputTokens, currentPlan.maxInputTokens)),
      maxOutputTokens: Math.max(0, toNumber(body.maxOutputTokens, currentPlan.maxOutputTokens)),
      priority: toNumber(body.priority, currentPlan.priority),
      allowFiles: toBoolean(body.allowFiles),
      allowImages: toBoolean(body.allowImages),
      allowOcr: toBoolean(body.allowOcr),
      isActive: toBoolean(body.isActive),
    },
  });

  await prisma.adminAction.create({
    data: {
      adminId: admin.id,
      action: "plan.update",
      targetType: "Plan",
      targetId: plan.id,
      description: `پلن ${plan.key} ویرایش شد.`,
      metadata: JSON.stringify({
        key: plan.key,
        price: plan.price,
        dailyMessages: plan.dailyMessages,
        monthlyMessages: plan.monthlyMessages,
        isActive: plan.isActive,
      }),
    },
  });

  return Response.json({ ok: true, plan });
}
