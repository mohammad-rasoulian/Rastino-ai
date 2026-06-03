import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

const defaultSettings = [
  {
    key: "settings.maintenanceMode",
    label: "حالت نگهداری",
    type: "boolean",
    value: "false",
  },
  {
    key: "settings.registrationEnabled",
    label: "ثبت‌نام کاربران",
    type: "boolean",
    value: "true",
  },
  {
    key: "settings.chatEnabled",
    label: "چت هوشمند",
    type: "boolean",
    value: "true",
  },
  {
    key: "settings.imageStudioEnabled",
    label: "استودیوی تصویر",
    type: "boolean",
    value: "true",
  },
  {
    key: "settings.openRouterMode",
    label: "حالت OpenRouter",
    type: "select",
    value: "mock",
  },
  {
    key: "settings.smsMode",
    label: "حالت پیامک",
    type: "select",
    value: "mock",
  },
  {
    key: "settings.publicBanner",
    label: "پیام اطلاع‌رسانی عمومی",
    type: "textarea",
    value: "",
  },
];

async function ensureSettings() {
  await Promise.all(
    defaultSettings.map((setting) =>
      prisma.siteContent.upsert({
        where: {
          key: setting.key,
        },
        update: {},
        create: {
          key: setting.key,
          label: setting.label,
          group: "settings",
          type: setting.type,
          value: setting.value,
          isPublic: false,
        },
      })
    )
  );
}

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json({ error: "دسترسی مدیریت ندارید." }, { status: 403 });
  }

  await ensureSettings();

  const settings = await prisma.siteContent.findMany({
    where: {
      group: "settings",
    },
    orderBy: {
      key: "asc",
    },
  });

  return Response.json({ settings });
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json({ error: "دسترسی مدیریت ندارید." }, { status: 403 });
  }

  await ensureSettings();

  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items : [];

  const allowedKeys = new Set(defaultSettings.map((setting) => setting.key));

  for (const item of items) {
    const key = String(item.key || "");
    const value = String(item.value ?? "");

    if (!allowedKeys.has(key)) {
      return Response.json(
        { error: `تنظیم نامعتبر است: ${key}` },
        { status: 400 }
      );
    }

    await prisma.siteContent.update({
      where: {
        key,
      },
      data: {
        value,
      },
    });
  }

  await prisma.adminAction.create({
    data: {
      adminId: admin.id,
      action: "settings.update",
      targetType: "SiteContent",
      description: "تنظیمات اصلی محصول تغییر کرد.",
      metadata: JSON.stringify({
        keys: items.map((item: { key: string }) => item.key),
      }),
    },
  });

  const settings = await prisma.siteContent.findMany({
    where: {
      group: "settings",
    },
    orderBy: {
      key: "asc",
    },
  });

  return Response.json({
    ok: true,
    settings,
  });
}
