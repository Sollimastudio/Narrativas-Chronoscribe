"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-blue-950 px-4 py-12 text-yellow-400">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950" />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#0000ff33,transparent_65%)] opacity-60"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/3 top-[-20%] -z-10 h-96 w-96 rounded-full bg-yellow-500/30 blur-3xl"
        aria-hidden="true"
      />

      <section className="w-full max-w-2xl space-y-8 rounded-3xl border-2 border-yellow-400 bg-blue-950/90 p-10 shadow-2xl shadow-yellow-400/20 backdrop-blur-md neon-border">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-yellow-300">
            Criar conta
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-yellow-400 text-glow">
              Narrativas Chronoscribe
            </h1>
            <p className="text-sm text-yellow-200">
              Cadastre-se para liberar o painel estratégico e prototipar campanhas com precisão multimídia.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-2 text-xs text-yellow-300 sm:grid-cols-2">
            <li className="flex items-center gap-2 rounded-lg border-2 border-yellow-500/40 bg-blue-900/50 px-3 py-2">
              <span className="text-yellow-400">•</span>
              Biblioteca de estilos narrativos
            </li>
            <li className="flex items-center gap-2 rounded-lg border-2 border-yellow-500/40 bg-blue-900/50 px-3 py-2">
              <span className="text-yellow-400">•</span>
              Análises críticas 100% viscerais
            </li>
            <li className="flex items-center gap-2 rounded-lg border-2 border-yellow-500/40 bg-blue-900/50 px-3 py-2">
              <span className="text-yellow-400">•</span>
              Exportação profissional de conteúdo
            </li>
            <li className="flex items-center gap-2 rounded-lg border-2 border-yellow-500/40 bg-blue-900/50 px-3 py-2">
              <span className="text-yellow-400">•</span>
              Colaboração segura em tempo real
            </li>
          </ul>
        </header>

        <RegisterForm />

        <footer className="text-center text-sm text-yellow-300">
          Já possui credenciais?{" "}
          <Link
            href="/login"
            className="font-semibold text-yellow-400 transition-colors hover:text-yellow-300 text-glow"
          >
            Acesse aqui
          </Link>
        </footer>
      </section>
    </main>
  );
}
