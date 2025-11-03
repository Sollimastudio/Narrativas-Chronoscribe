import { prisma } from "../prisma/client";
import { env } from "@/config/env";
import { PlanLimitError } from "@/utils/errors";

export interface ActiveSubscriptionResult {
  subscription: Awaited<ReturnType<typeof prisma.subscription.findFirst>>;
  plan: Awaited<ReturnType<typeof prisma.plan.findUnique>>;
}

export const DEFAULT_PLANS = [
  {
    slug: "free",
    name: "Essencial",
    description:
      "Ideal para experimentação. Limites diários e mensais controlados.",
    dailyGenerationsLimit: 5,
    monthlyGenerationsLimit: 60,
    priceCents: 0,
    currency: "USD",
  },
  {
    slug: "creator",
    name: "Creator",
    description:
      "Produção recorrente com maior cadência diária e suporte prioritário.",
    dailyGenerationsLimit: 25,
    monthlyGenerationsLimit: 400,
    priceCents: 4900,
    currency: "USD",
  },
  {
    slug: "scale",
    name: "Scale",
    description:
      "Equipes e lançamentos em escala. Limites amplos e colaboração.",
    dailyGenerationsLimit: 100,
    monthlyGenerationsLimit: 2000,
    priceCents: 14900,
    currency: "USD",
  },
] as const;

export async function upsertDefaultPlans() {
  for (const plan of DEFAULT_PLANS) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        description: plan.description,
        dailyGenerationsLimit: plan.dailyGenerationsLimit,
        monthlyGenerationsLimit: plan.monthlyGenerationsLimit,
        priceCents: plan.priceCents,
        currency: plan.currency,
        isActive: true,
      },
      create: {
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        dailyGenerationsLimit: plan.dailyGenerationsLimit,
        monthlyGenerationsLimit: plan.monthlyGenerationsLimit,
        priceCents: plan.priceCents,
        currency: plan.currency,
        isActive: true,
      },
    } as never);
  }
}

async function ensurePlansSeeded() {
  const planCount = await prisma.plan.count();
  if (planCount === 0) {
    await upsertDefaultPlans();
  }
}

export async function getActiveSubscription(userId: string) {
  await ensurePlansSeeded();

  const subscription = (await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["ACTIVE", "TRIALING"] },
      isActive: true,
    } as never,
    include: { plan: true } as never,
  })) as unknown as {
    plan: {
      dailyGenerationsLimit: number | null;
      monthlyGenerationsLimit: number | null;
      [key: string]: unknown;
    } | null;
  } | null;

  if (subscription) {
    return subscription;
  }

  const fallbackPlan =
    (await prisma.plan.findUnique({
      where: { slug: env.defaults.planSlug },
    })) ??
    (await prisma.plan.findFirst({
      where: { isActive: true } as never,
      orderBy: { priceCents: "asc" } as never,
    }));

  if (!fallbackPlan) {
    throw new Error(
      "Nenhum plano ativo cadastrado. Execute o seed de planos antes de iniciar o app."
    );
  }

  return (await prisma.subscription.create({
    data: {
      userId,
      planId: fallbackPlan.id,
      status: "ACTIVE",
      isActive: true,
    } as never,
    include: { plan: true } as never,
  })) as unknown as {
    plan: {
      dailyGenerationsLimit: number | null;
      monthlyGenerationsLimit: number | null;
      [key: string]: unknown;
    } | null;
  };
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

  if (!plan) {
    throw new Error("Assinatura ativa não encontrou plano associado.");
  }

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
      throw new PlanLimitError(
        "Limite diário atingido. Faça upgrade do plano ou aguarde a virada do dia.",
        { type: "daily", limit: dailyLimit }
      );
    }
  }

  if (monthlyLimit !== null) {
    const monthlyCount = await prisma.usageLog.count({
      where: {
        userId,
        type: "TEXT_GENERATION",
        createdAt: {
          gte: startOfMonth(now),
        },
      },
    });

    if (monthlyCount >= monthlyLimit) {
      throw new PlanLimitError(
        "Limite mensal atingido. Considere migrar para um plano maior.",
        { type: "monthly", limit: monthlyLimit }
      );
    }
  }

  return { plan, subscription };
}

export async function getUsageSnapshot(userId: string) {
  const subscription = await getActiveSubscription(userId);
  const plan = subscription.plan;

  if (!plan) {
    throw new Error("Plano associado à assinatura não encontrado.");
  }

  const now = new Date();

  const [dailyCount, monthlyCount] = await Promise.all([
    prisma.usageLog.count({
      where: {
        userId,
        type: "TEXT_GENERATION",
        createdAt: { gte: startOfDay(now) },
      },
    }),
    prisma.usageLog.count({
      where: {
        userId,
        type: "TEXT_GENERATION",
        createdAt: { gte: startOfMonth(now) },
      },
    }),
  ]);

  return {
    plan,
    subscription,
    usage: {
      dailyCount,
      monthlyCount,
      dailyLimit: plan.dailyGenerationsLimit,
      monthlyLimit: plan.monthlyGenerationsLimit,
    },
  };
}
