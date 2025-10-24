"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  const [justRegistered, setJustRegistered] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setJustRegistered(params.get("registered") === "1");
    setEmail(params.get("email") ?? "");
    setCallbackUrl(params.get("callbackUrl") ?? "/");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.replace(result?.url ?? "/");
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/70 p-8 shadow-lg shadow-black/50">
        <h1 className="text-2xl font-semibold text-yellow-300 text-center">
          Entrar no Chronoscribe
        </h1>
        <p className="mt-2 text-sm text-neutral-400 text-center">
          Acesse com suas credenciais para conversar com o Arquiteto.
        </p>

        {justRegistered && (
          <p className="mt-6 text-sm text-green-400 bg-green-500/10 border border-green-400/40 rounded-lg px-3 py-2">
            Cadastro concluído! Faça login para acessar o Arquiteto.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-neutral-200">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
              placeholder="voce@email.com"
              autoComplete="email"
            />
          </label>

          <label className="block text-sm font-medium text-neutral-200">
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
              placeholder="********"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-yellow-500/40 bg-yellow-400/20 px-6 py-3 text-lg font-semibold text-yellow-200 transition hover:bg-yellow-400/30 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:bg-neutral-900 disabled:text-neutral-500"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Ainda não tem conta?{" "}
          <Link href="/register" className="text-yellow-300 hover:text-yellow-200">
            Cadastre-se agora
          </Link>
        </p>
      </div>
    </div>
  );
}
