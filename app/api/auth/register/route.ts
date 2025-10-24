import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Informe e-mail e senha." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(String(password), 12);

    await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name ? String(name) : null,
        passwordHash,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[register] erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Não foi possível concluir o cadastro." },
      { status: 500 }
    );
  }
}
