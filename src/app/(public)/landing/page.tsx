"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  const { data } = useSession();
  const isAuthenticated = Boolean(data?.user);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-16 text-slate-100">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#0f172a,transparent_60%)] opacity-70"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/4 top-[-10%] -z-10 h-[28rem] w-[28rem] rounded-full bg-sky-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute right-0 bottom-[-20%] -z-10 h-[26rem] w-[26rem] rounded-full bg-amber-500/20 blur-3xl"
        aria-hidden="true"
      />

      <section className="relative w-full max-w-4xl space-y-8 rounded-[28px] border border-slate-800/60 bg-slate-950/70 p-10 shadow-2xl shadow-sky-900/30 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.5em] text-sky-300">
          Meta-agente L5
        </p>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-slate-50 sm:text-4xl">
            ChronoScribe: arquitetura narrativa preditiva para equipes criativas
          </h1>
          <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
            Modele campanhas, roteiros e lançamentos multimídia com segurança. O
            Meta-Agente L5 transforma briefings em estruturas acionáveis,
            garantindo consistência de voz, prazos e uma experiência visceral.
          </p>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Biblioteca
            </p>
            <p className="mt-1 text-sm font-medium text-slate-100">
              16+ estilos narrativos
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Inteligência crítica
            </p>
            <p className="mt-1 text-sm font-medium text-slate-100">
              Score visceral em tempo real
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Exportação
            </p>
            <p className="mt-1 text-sm font-medium text-slate-100">
              PDF, DOCX, EPUB e roteiros
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-400 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-sky-500/40"
          >
            {isAuthenticated ? "Abrir painel" : "Entrar"}
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-8 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-500 hover:text-slate-50"
          >
            Criar conta
          </Link>
        </div>
      </section>
    </main>
  );
}
