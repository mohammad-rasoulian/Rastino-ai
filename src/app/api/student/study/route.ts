import { getRequestUser } from "@/lib/auth/request-user";
import { prisma } from "@/lib/prisma";
import { generateStudentAnswer } from "@/lib/student/avalai";

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diffToSaturday = day === 6 ? 0 : day + 1;
  const start = new Date(now);
  start.setDate(now.getDate() - diffToSaturday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  end.setHours(0, 0, 0, 0);

  return { start, end };
}

async function getOrCreateCurrentPlan(userId: string) {
  const { start, end } = getWeekRange();

  const existing = await prisma.studentStudyPlan.findFirst({
    where: {
      userId,
      weekStart: start,
      status: "active",
    },
  });

  if (existing) return existing;

  return prisma.studentStudyPlan.create({
    data: {
      userId,
      title: "برنامه مطالعه این هفته",
      weekStart: start,
      weekEnd: end,
    },
  });
}

export async function GET() {
  const user = await getRequestUser();
  const plan = await getOrCreateCurrentPlan(user.id);

  const [tasks, stats, messages] = await Promise.all([
    prisma.studentStudyTask.findMany({
      where: {
        userId: user.id,
        planId: plan.id,
      },
      orderBy: [{ dayIndex: "asc" }, { createdAt: "asc" }],
    }),
    prisma.studentStudyStat.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 12,
    }),
    prisma.studentCoachMessage.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 30,
    }),
  ]);

  return Response.json({ plan, tasks, stats, messages });
}

export async function POST(req: Request) {
  const user = await getRequestUser();
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "");

  const plan = await getOrCreateCurrentPlan(user.id);

  if (action === "create-task") {
    const title = String(body.title || "").trim();
    const subject = String(body.subject || "عمومی").trim();
    const bookTitle = String(body.bookTitle || "").trim();
    const dayIndex = Math.max(0, Math.min(6, Number(body.dayIndex) || 0));
    const minutes = Math.max(10, Math.min(360, Number(body.minutes) || 45));

    if (!title) {
      return Response.json({ error: "عنوان کار را وارد کن." }, { status: 400 });
    }

    const task = await prisma.studentStudyTask.create({
      data: {
        userId: user.id,
        planId: plan.id,
        title,
        subject,
        bookTitle: bookTitle || null,
        dayIndex,
        minutes,
      },
    });

    return Response.json({ task });
  }

  if (action === "toggle-task") {
    const taskId = String(body.taskId || "");
    const task = await prisma.studentStudyTask.findFirst({
      where: {
        id: taskId,
        userId: user.id,
      },
    });

    if (!task) {
      return Response.json({ error: "کار پیدا نشد." }, { status: 404 });
    }

    const nextStatus = task.status === "done" ? "todo" : "done";
    const nextProgress = nextStatus === "done" ? 100 : 0;

    const updated = await prisma.studentStudyTask.update({
      where: {
        id: task.id,
      },
      data: {
        status: nextStatus,
        progress: nextProgress,
      },
    });

    if (nextStatus === "done") {
      await prisma.studentStudyStat.upsert({
        where: {
          userId_subject_bookTitle: {
            userId: user.id,
            subject: task.subject,
            bookTitle: task.bookTitle || "",
          },
        },
        create: {
          userId: user.id,
          subject: task.subject,
          bookTitle: task.bookTitle || "",
          studiedMinutes: task.minutes,
          readiness: 20,
        },
        update: {
          studiedMinutes: {
            increment: task.minutes,
          },
          readiness: {
            increment: 10,
          },
        },
      });
    }

    return Response.json({ task: updated });
  }

  if (action === "coach-message") {
    const message = String(body.message || "").trim();

    if (!message) {
      return Response.json({ error: "پیام مشاور را وارد کن." }, { status: 400 });
    }

    const [tasks, stats] = await Promise.all([
      prisma.studentStudyTask.findMany({
        where: {
          userId: user.id,
          planId: plan.id,
        },
        orderBy: [{ dayIndex: "asc" }],
      }),
      prisma.studentStudyStat.findMany({
        where: {
          userId: user.id,
        },
        orderBy: [{ updatedAt: "desc" }],
        take: 12,
      }),
    ]);

    await prisma.studentCoachMessage.create({
      data: {
        userId: user.id,
        role: "user",
        content: message,
      },
    });

    const prompt = `تو مشاور مطالعه راستینو هستی. باید عملی، مهربان، دقیق و قابل اجرا راهنمایی کنی.

پیام دانش‌آموز:
${message}

برنامه این هفته:
${tasks.map((task) => `روز ${task.dayIndex + 1}: ${task.subject} - ${task.title} - ${task.minutes} دقیقه - وضعیت: ${task.status}`).join("\n") || "هنوز برنامه‌ای ثبت نشده."}

آمار آمادگی:
${stats.map((stat) => `${stat.subject}: ${stat.studiedMinutes} دقیقه مطالعه، آمادگی ${stat.readiness}%`).join("\n") || "هنوز آماری ثبت نشده."}

قواعد:
- جواب کوتاه اما کاربردی بده.
- اگر برنامه لازم است، پیشنهاد روزانه و قابل انجام بده.
- به جای انگیزشی کلی، قدم بعدی مشخص بده.
- اگر دانش‌آموز فشار یا استرس دارد، آرامش بده ولی راه‌حل عملی هم بده.`;

    const answer = await generateStudentAnswer(prompt);

    const assistantMessage = await prisma.studentCoachMessage.create({
      data: {
        userId: user.id,
        role: "assistant",
        content: answer.content,
        metadata: JSON.stringify({
          model: answer.model,
          usage: answer.usage,
          requestId: answer.requestId,
        }),
      },
    });

    return Response.json({ message: assistantMessage });
  }

  return Response.json({ error: "action نامعتبر است." }, { status: 400 });
}
