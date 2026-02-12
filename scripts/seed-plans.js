#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULT_PLANS = [
  {
    slug: "free",
    name: "Plano Essencial",
    description:
      "Ideal para experimentar o Arquiteto. Limite diário e mensal controlados.",
    priceCents: 0,
    currency: "USD",
  },
  {
    slug: "creator",
    name: "Creator",
    description:
      "Pacote recomendado para criadores consistentes. Libera mais execuções por dia e suporte prioritário.",
    priceCents: 4900,
    currency: "USD",
  },
  {
    slug: "scale",
    name: "Scale",
    description:
      "Para equipes e lançamentos em larga escala. Limites amplos e espaço para experimentação.",
    priceCents: 14900,
    currency: "USD",
  },
];

async function main() {
  for (const plan of DEFAULT_PLANS) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        description: plan.description,
        priceCents: plan.priceCents,
        currency: plan.currency,
        isActive: true,
      },
      create: {
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        priceCents: plan.priceCents,
        currency: plan.currency,
        isActive: true,
      },
    });
  }
  console.log("✅ Planos padrão atualizados.");
}

main()
  .catch((error) => {
    console.error("❌ Falha ao semear planos:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
