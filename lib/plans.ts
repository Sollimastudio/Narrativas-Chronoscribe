import prisma from "@/lib/prisma";

export type PlanSeed = {
  slug: string;
  name: string;
  description: string;
  dailyGenerationsLimit: number | null;
  monthlyGenerationsLimit: number | null;
  priceCents: number;
  currency: string;
};

export const DEFAULT_PLANS: PlanSeed[] = [
  {
    slug: "free",
    name: "Plano Essencial",
    description:
      "Ideal para experimentar o Arquiteto. Limite diário e mensal controlados.",
    dailyGenerationsLimit: 5,
    monthlyGenerationsLimit: 100,
    priceCents: 0,
    currency: "USD",
  },
  {
    slug: "creator",
    name: "Creator",
    description:
      "Pacote recomendado para criadores consistentes. Libera mais execuções por dia e suporte prioritário.",
    dailyGenerationsLimit: 25,
    monthlyGenerationsLimit: 600,
    priceCents: 4900,
    currency: "USD",
  },
  {
    slug: "scale",
    name: "Scale",
    description:
      "Para equipes e lançamentos em larga escala. Limites amplos e espaço para experimentação.",
    dailyGenerationsLimit: 100,
    monthlyGenerationsLimit: 2500,
    priceCents: 14900,
    currency: "USD",
  },
];

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
      },
    });
  }
}

export async function getPlanBySlug(slug: string) {
  return prisma.plan.findUnique({
    where: { slug },
  });
}
