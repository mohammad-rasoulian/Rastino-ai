import { prisma } from "@/lib/prisma";
import { getPlanConfig } from "@/lib/billing/plans";
import {
  getPaymentBaseUrl,
  parseZibalTransactionMeta,
  stringifyZibalMeta,
  verifyZibalPayment,
} from "@/lib/payments/zibal";

function redirectTo(path: string) {
  return Response.redirect(`${getPaymentBaseUrl()}${path}`, 302);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function ensurePlanRecord(planId: "plus" | "pro") {
  const config = getPlanConfig(planId);

  return prisma.plan.upsert({
    where: { key: planId },
    update: {
      name: config.nameEn,
      description: config.description,
      price: config.priceToman,
      currency: "IRR",
      monthlyMessages: config.monthlyCredits,
      dailyMessages: config.dailyMessages,
      allowFiles: true,
      allowImages: true,
      allowOcr: planId === "pro",
      isActive: true,
    },
    create: {
      key: planId,
      name: config.nameEn,
      description: config.description,
      price: config.priceToman,
      currency: "IRR",
      monthlyMessages: config.monthlyCredits,
      dailyMessages: config.dailyMessages,
      maxInputTokens: planId === "pro" ? 6000 : 3000,
      maxOutputTokens: planId === "pro" ? 4000 : 2500,
      allowFiles: true,
      allowImages: true,
      allowOcr: planId === "pro",
      priority: planId === "pro" ? 2 : 1,
      isActive: true,
    },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const success = url.searchParams.get("success");
  const trackId = url.searchParams.get("trackId");
  const orderId = url.searchParams.get("orderId");
  const status = url.searchParams.get("status");

  if (!trackId) {
    return redirectTo("/pricing?payment=failed&reason=missing-track");
  }

  const transaction = await prisma.transaction.findFirst({
    where: {
      provider: "zibal",
      OR: [
        { authority: String(trackId) },
        { refId: orderId || undefined },
      ],
    },
    include: {
      wallet: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!transaction) {
    return redirectTo("/pricing?payment=failed&reason=transaction-not-found");
  }

  const meta = parseZibalTransactionMeta(transaction.description);

  if (!meta) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "failed" },
    });

    return redirectTo("/pricing?payment=failed&reason=invalid-meta");
  }

  if (transaction.status === "success") {
    return redirectTo(`/app?payment=success&plan=${meta.planId}`);
  }

  if (success !== "1" || status !== "2") {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "failed" },
    });

    return redirectTo(`/pricing?payment=failed&plan=${meta.planId}`);
  }

  try {
    const verify = await verifyZibalPayment(trackId);

    if (verify.result !== 100 && verify.result !== 201) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "failed",
          description: stringifyZibalMeta({
            ...meta,
            verifiedAt: new Date().toISOString(),
            zibal: verify,
          }),
        },
      });

      return redirectTo(
        `/pricing?payment=failed&plan=${meta.planId}&result=${verify.result}`
      );
    }

    if (meta.planId !== "plus" && meta.planId !== "pro") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "failed" },
      });

      return redirectTo("/pricing?payment=failed&reason=invalid-plan");
    }

    const planRecord = await ensurePlanRecord(meta.planId);
    const now = new Date();

    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "success",
          description: stringifyZibalMeta({
            ...meta,
            verifiedAt: now.toISOString(),
            zibal: verify,
          }),
        },
      }),
      prisma.user.update({
        where: { id: transaction.wallet.userId },
        data: { plan: meta.planId },
      }),
      prisma.subscription.updateMany({
        where: {
          userId: transaction.wallet.userId,
          status: "active",
        },
        data: { status: "expired" },
      }),
      prisma.subscription.create({
        data: {
          userId: transaction.wallet.userId,
          planId: planRecord.id,
          status: "active",
          startedAt: now,
          expiresAt: addDays(now, 30),
        },
      }),
    ]);

    return redirectTo(`/app?payment=success&plan=${meta.planId}`);
  } catch (error) {
    console.error("[ZIBAL PAYMENT VERIFY ERROR]", error);
    return redirectTo(`/pricing?payment=failed&plan=${meta.planId}&reason=verify-error`);
  }
}
