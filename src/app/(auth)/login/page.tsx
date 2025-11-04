// src/app/(auth)/login/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-blue-950 px-4 py-12 text-yellow-400">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950" />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#0000ff33,transparent_65%)] opacity-70"
        aria-hidden="true"
      />
      <div
        className="absolute -top-32 right-1/4 -z-10 h-72 w-72 rounded-full bg-yellow-500/30 blur-3xl"
        aria-hidden="true"
      />
      <div className="w-full max-w-md space-y-8 rounded-3xl border-2 border-yellow-400 bg-blue-950/90 p-8 shadow-2xl shadow-yellow-400/20 backdrop-blur-md neon-border">
        <header className="space-y-3 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.4em] text-yellow-300">
            Narrativas Chronoscribe
          </div>
          <h1 className="text-3xl font-bold text-yellow-400 text-glow">
            Seu Arquiteto Mestre Escriba
          </h1>
          <p className="text-sm text-yellow-200">
            Conduza narrativas estratégicas com segurança e precisão.
          </p>
        </header>

        <LoginForm />

        <p className="text-center text-sm text-yellow-300">
          Não tem conta?{" "}
          <Link
            href="/register"
            className="font-semibold text-yellow-400 transition-colors hover:text-yellow-300 text-glow"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}
