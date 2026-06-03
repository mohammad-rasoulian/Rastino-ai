import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function GET() {
  const items = await prisma.siteContent.findMany({
    where: {
      isPublic: true,
    },
    orderBy: [
      {
        group: "asc",
      },
      {
        key: "asc",
      },
    ],
  });

  const content = Object.fromEntries(
    items.map((item) => [
      item.key,
      {
        id: item.id,
        key: item.key,
        label: item.label,
        group: item.group,
        type: item.type,
        value: item.value,
      },
    ])
  );

  return Response.json({
    items,
    content,
  });
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json(
      { error: "دسترسی مدیریت ندارید." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const updates = Array.isArray(body.items) ? body.items : [];

  const saved = [];

  for (const item of updates) {
    const key = String(item.key || "").trim();
    const value = String(item.value || "");

    if (!key) continue;

    const updated = await prisma.siteContent.update({
      where: {
        key,
      },
      data: {
        value,
      },
    });

    saved.push(updated);
  }

  await prisma.adminAction.create({
    data: {
      adminId: admin.id,
      action: "site_content_update",
      targetType: "SiteContent",
      description: "Site content updated from admin panel",
      metadata: JSON.stringify({
        count: saved.length,
        keys: saved.map((item) => item.key),
      }),
    },
  });

  return Response.json({
    ok: true,
    items: saved,
  });
}
