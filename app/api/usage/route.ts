import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsageSnapshot } from "@/lib/usage";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId =
    session?.user && "id" in session.user ? (session.user.id as string) : null;

  if (!session || !userId) {
    return NextResponse.json(
      { error: "Autenticação necessária." },
      { status: 401 }
    );
  }

  try {
    const snapshot = await getUsageSnapshot(userId);
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("[usage] falha ao obter snapshot:", error);
    return NextResponse.json(
      { error: "Não foi possível recuperar informações de uso." },
      { status: 500 }
    );
  }
}
