import { prisma } from "@/lib/prisma";
import {
  getPlanConfig,
  normalizePlanId,
  type PlanId,
} from "@/lib/billing/plans";
import {
  getZibalStartUrl,
  requestZibalPayment,
  stringifyZibalMeta,
  type ZibalTransactionMeta,
} from "@/lib/payments/zibal";
import {
  getRequestUser,
  isUnauthorizedError,
  unauthorizedResponse,
} from "@/lib/auth/request-user";

function createOrderId(planId: PlanId) {
  const random = Math.random().toString(36).slice(2, 8);
  return `rastino-${planId}-${Date.now()}-${random}`;
}

export async function POST(req: Request) {
  try {
    const user = await getRequestUser();
    const body = await req.json().catch(() => ({}));

    const planId = normalizePlanId(String(body.planId || ""));
    const plan = getPlanConfig(planId);

    if (plan.id === "free") {
      return Response.json(
        { error: "پلن رایگان نیاز به پرداخت ندارد.", code: "FREE_PLAN" },
        { status: 400 }
      );
    }

    if (plan.priceToman <= 0) {
      return Response.json(
        { error: "قیمت پلن معتبر نیست.", code: "INVALID_PLAN_PRICE" },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        balance: 0,
        currency: "IRR",
      },
    });

    const orderId = createOrderId(plan.id);
    const amountRial = plan.priceToman * 10;

    const payment = await requestZibalPayment({
      amountRial,
      orderId,
      description: `خرید پلن ${plan.nameFa} راستینو`,
      mobile: user.mobile,
    });

    if (payment.result !== 100 || !payment.trackId) {
      return Response.json(
        {
          error: payment.message || "درخواست پرداخت ناموفق بود.",
          code: "ZIBAL_REQUEST_FAILED",
          result: payment.result,
        },
        { status: 502 }
      );
    }

    const meta: ZibalTransactionMeta = {
      kind: "subscription",
      planId: plan.id,
      userId: user.id,
      orderId,
      amountRial,
      amountToman: plan.priceToman,
      createdAt: new Date().toISOString(),
      zibal: payment,
    };

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount: amountRial,
        type: "subscription_purchase",
        status: "pending",
        provider: "zibal",
        authority: String(payment.trackId),
        refId: orderId,
        description: stringifyZibalMeta(meta),
      },
    });

    return Response.json({
      ok: true,
      provider: "zibal",
      planId: plan.id,
      amountRial,
      amountToman: plan.priceToman,
      orderId,
      trackId: payment.trackId,
      redirectUrl: getZibalStartUrl(payment.trackId),
    });
  } catch (error) {
    if (isUnauthorizedError(error)) return unauthorizedResponse();

    console.error("[ZIBAL PAYMENT REQUEST ERROR]", error);

    return Response.json(
      {
        error: "خطا در شروع پرداخت. لطفاً چند لحظه بعد دوباره تلاش کنید.",
        code: "PAYMENT_REQUEST_ERROR",
      },
      { status: 500 }
    );
  }
}
