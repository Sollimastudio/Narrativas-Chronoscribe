// src/app/(auth)/login/page.tsx
"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

function LoginFormWrapper() {
  return (
    <Suspense fallback={<div className="text-center text-slate-400">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#1e293b,transparent_65%)] opacity-70"
        aria-hidden="true"
      />
      <div
        className="absolute -top-32 right-1/4 -z-10 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800/60 bg-slate-950/70 p-8 shadow-2xl shadow-blue-900/30 backdrop-blur-md">
        <header className="space-y-3 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
            Acesso Chronoscribe
          </div>
          <h1 className="text-3xl font-bold text-amber-100">
            Entre no Meta-Agente L5
          </h1>
          <p className="text-sm text-slate-400">
            Conduza narrativas estratégicas com segurança e precisão.
          </p>
        </header>

        <LoginFormWrapper />

        <p className="text-center text-sm text-slate-400">
          Não tem conta?{" "}
          <Link
            href="/register"
            className="font-semibold text-amber-300 transition-colors hover:text-amber-200"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}
