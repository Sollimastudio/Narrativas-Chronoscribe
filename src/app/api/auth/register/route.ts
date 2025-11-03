import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "../../../../server/prisma/client";
import { BadRequestError } from "@/utils/errors";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (typeof body !== "object" || !body) {
      throw new BadRequestError("Payload inválido.");
    }

    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : undefined;

    if (!email || !email.includes("@")) {
      throw new BadRequestError("Informe um e-mail válido.");
    }

    if (password.length < 8) {
      throw new BadRequestError("A senha deve conter ao menos 8 caracteres.");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestError("Este e-mail já está cadastrado.");
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof BadRequestError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }

    console.error("[register] erro inesperado:", error);
    return NextResponse.json(
      { error: "Não foi possível concluir o cadastro." },
      { status: 500 }
    );
  }
}
