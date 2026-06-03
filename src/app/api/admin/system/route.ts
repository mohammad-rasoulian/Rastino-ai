import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

function envStatus(name: string) {
  const value = process.env[name];

  return {
    name,
    exists: Boolean(value),
    configured: Boolean(value && value.trim().length > 0),
  };
}

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return Response.json({ error: "دسترسی مدیریت ندارید." }, { status: 403 });
  }

  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    const [users, chats, messages, plans, prompts, usageLogs, transactions] =
      await Promise.all([
        prisma.user.count(),
        prisma.chat.count(),
        prisma.message.count(),
        prisma.plan.count(),
        prisma.promptTemplate.count(),
        prisma.usageLog.count(),
        prisma.transaction.count(),
      ]);

    return Response.json({
      system: {
        ok: true,
        service: "rastino",
        database: "connected",
        uptime: process.uptime(),
        responseTimeMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
        env: [
          envStatus("DATABASE_URL"),
          envStatus("NEXT_PUBLIC_SITE_URL"),
          envStatus("OPENROUTER_API_KEY"),
          envStatus("OPENROUTER_DEFAULT_MODEL"),
          envStatus("OPENROUTER_SITE_URL"),
          envStatus("OPENROUTER_SITE_NAME"),
        ],
        counts: {
          users,
          chats,
          messages,
          plans,
          prompts,
          usageLogs,
          transactions,
        },
      },
    });
  } catch (error) {
    console.error("[ADMIN SYSTEM ERROR]", error);

    return Response.json(
      {
        system: {
          ok: false,
          service: "rastino",
          database: "disconnected",
          responseTimeMs: Date.now() - startedAt,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
