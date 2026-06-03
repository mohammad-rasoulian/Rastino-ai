import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json({ error: "دسترسی مدیریت ندارید." }, { status: 403 });
  }

  const prompts = await prisma.promptTemplate.findMany({
    orderBy: [{ category: "asc" }, { key: "asc" }],
  });

  return Response.json({ prompts });
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json({ error: "دسترسی مدیریت ندارید." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");

  if (!id) {
    return Response.json(
      { error: "شناسه پرامپت ارسال نشده است." },
      { status: 400 }
    );
  }

  const prompt = await prisma.promptTemplate.update({
    where: { id },
    data: {
      title: String(body.title || ""),
      category: String(body.category || "general"),
      description: String(body.description || ""),
      content: String(body.content || ""),
      isActive: Boolean(body.isActive),
    },
  });

  await prisma.adminAction.create({
    data: {
      adminId: admin.id,
      action: "prompt.update",
      targetType: "PromptTemplate",
      targetId: prompt.id,
      description: `پرامپت ${prompt.key} ویرایش شد.`,
      metadata: JSON.stringify({
        key: prompt.key,
        category: prompt.category,
        isActive: prompt.isActive,
      }),
    },
  });

  return Response.json({ ok: true, prompt });
}
