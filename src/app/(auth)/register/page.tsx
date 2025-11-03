"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#312e81,transparent_65%)] opacity-60"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/3 top-[-20%] -z-10 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl"
        aria-hidden="true"
      />

      <section className="w-full max-w-2xl space-y-8 rounded-3xl border border-slate-800/60 bg-slate-950/70 p-10 shadow-2xl shadow-violet-900/30 backdrop-blur-md">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-fuchsia-300">
            Criar conta
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-fuchsia-100">
              Construa narrativas com o Meta-Agente L5
            </h1>
            <p className="text-sm text-slate-400">
              Cadastre-se para liberar o painel estratégico e prototipar campanhas com precisão multimídia.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-2 text-xs text-slate-400 sm:grid-cols-2">
            <li className="flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/40 px-3 py-2">
              <span className="text-fuchsia-300">•</span>
              Biblioteca de estilos narrativos
            </li>
            <li className="flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/40 px-3 py-2">
              <span className="text-fuchsia-300">•</span>
              Análises críticas 100% viscerais
            </li>
            <li className="flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/40 px-3 py-2">
              <span className="text-fuchsia-300">•</span>
              Exportação profissional de conteúdo
            </li>
            <li className="flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/40 px-3 py-2">
              <span className="text-fuchsia-300">•</span>
              Colaboração segura em tempo real
            </li>
          </ul>
        </header>

        <RegisterForm />

        <footer className="text-center text-sm text-slate-400">
          Já possui credenciais?{" "}
          <Link
            href="/login"
            className="font-semibold text-sky-300 transition-colors hover:text-sky-200"
          >
            Acesse aqui
          </Link>
        </footer>
      </section>
    </main>
  );
}
