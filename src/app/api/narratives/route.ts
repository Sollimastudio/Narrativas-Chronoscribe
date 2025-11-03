import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { NarrativeService } from "@/server/ai/narrative-service";
import { authOptions } from "@/server/auth/options";
import { prisma } from "../../../server/prisma/client";
import { enforcePlanLimits } from "@/server/usage/limits";
import {
  BadRequestError,
  PlanLimitError,
  ProviderError,
  UnauthorizedError,
} from "@/utils/errors";
import { validateGenerationContext } from "@/domain/narratives/schema";

const narrativeService = new NarrativeService();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId =
      session?.user && "id" in session.user
        ? (session.user.id as string)
        : undefined;

    if (!session || !userId) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validation = validateGenerationContext(body);

    if (!validation.ok) {
      throw new BadRequestError("Payload inválido.", validation.issues);
    }

    await enforcePlanLimits(userId);

    const result = await narrativeService.generateNarrative(validation.data);

    await prisma.usageLog.create({
      data: {
        userId,
        type: "TEXT_GENERATION",
        promptId: result.id,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof BadRequestError) {
      return NextResponse.json(
        { error: error.message, issues: error.details },
        { status: error.status }
      );
    }

    if (error instanceof PlanLimitError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }

    if (error instanceof ProviderError) {
      return NextResponse.json(
        {
          error: "Falha ao acionar o provedor de IA.",
          details: error.message,
          provider: error.provider,
        },
        { status: error.status }
      );
    }

    console.error("[api/narratives] erro inesperado:", error);
    return NextResponse.json(
      { error: "Erro inesperado. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}
