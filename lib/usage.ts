import prisma from "@/lib/prisma";
import { upsertDefaultPlans, getPlanBySlug } from "@/lib/plans";

export type ActiveSubscription = Awaited<
  ReturnType<typeof getActiveSubscription>
>;

const DEFAULT_PLAN_SLUG = process.env.DEFAULT_PLAN_SLUG || "free";

export async function ensurePlansSeeded() {
  const count = await prisma.plan.count();
  if (count === 0) {
    await upsertDefaultPlans();
  }
}

export async function getActiveSubscription(userId: string) {
  await ensurePlansSeeded();

  let subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["ACTIVE", "TRIALING"] },
    },
    include: { plan: true },
  });

  if (!subscription) {
    const fallbackPlan =
      (await getPlanBySlug(DEFAULT_PLAN_SLUG)) ??
      (await prisma.plan.findFirst({
        where: { isActive: true },
        orderBy: { priceCents: "asc" },
      }));

    if (!fallbackPlan) {
      throw new Error(
        "Nenhum plano ativo cadastrado. Execute npm run seed:plans."
      );
    }

    subscription = await prisma.subscription.create({
      data: {
        userId,
        planId: fallbackPlan.id,
        status: "ACTIVE",
      },
      include: { plan: true },
    });
  }

  return subscription;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function enforcePlanLimits(userId: string) {
  const subscription = await getActiveSubscription(userId);
  const plan = subscription.plan;

  const now = new Date();
  const dailyLimit = plan.dailyGenerationsLimit ?? null;
  const monthlyLimit = plan.monthlyGenerationsLimit ?? null;

  if (dailyLimit !== null) {
    const todayCount = await prisma.usageLog.count({
      where: {
        userId,
        type: "TEXT_GENERATION",
        createdAt: {
          gte: startOfDay(now),
        },
      },
    });

    if (todayCount >= dailyLimit) {
      return {
        ok: false,
        status: 429,
        message:
          "Limite diário atingido. Aguarde até amanhã ou faça upgrade do seu plano.",
        details: {
          type: "daily",
          limit: dailyLimit,
        },
      } as const;
    }
  }

  if (monthlyLimit !== null) {
    const monthCount = await prisma.usageLog.count({
      where: {
        userId,
        type: "TEXT_GENERATION",
        createdAt: {
          gte: startOfMonth(now),
        },
      },
    });

    if (monthCount >= monthlyLimit) {
      return {
        ok: false,
        status: 429,
        message:
          "Limite mensal atingido. Faça upgrade do plano para continuar produzindo narrativas.",
        details: {
          type: "monthly",
          limit: monthlyLimit,
        },
      } as const;
    }
  }

  return {
    ok: true,
    subscription,
  } as const;
}

export async function getUsageSnapshot(userId: string) {
  const subscription = await getActiveSubscription(userId);
  const plan = subscription.plan;
  const now = new Date();

  const dailyCount = await prisma.usageLog.count({
    where: {
      userId,
      type: "TEXT_GENERATION",
      createdAt: { gte: startOfDay(now) },
    },
  });

  const monthlyCount = await prisma.usageLog.count({
    where: {
      userId,
      type: "TEXT_GENERATION",
      createdAt: { gte: startOfMonth(now) },
    },
  });

  return {
    subscription,
    plan,
    usage: {
      dailyCount,
      monthlyCount,
      dailyLimit: plan.dailyGenerationsLimit,
      monthlyLimit: plan.monthlyGenerationsLimit,
    },
  };
}
