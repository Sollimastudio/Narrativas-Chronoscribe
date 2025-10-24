"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível concluir o cadastro.");
      setIsSubmitting(false);
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/70 p-8 shadow-lg shadow-black/50">
        <h1 className="text-2xl font-semibold text-yellow-300 text-center">
          Criar conta
        </h1>
        <p className="mt-2 text-sm text-neutral-400 text-center">
          Em poucos cliques você terá acesso ao Arquiteto de Narrativas.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-neutral-200">
            Nome (opcional)
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
              placeholder="Como quer ser chamado?"
            />
          </label>

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
              placeholder="Min. 8 caracteres"
              autoComplete="new-password"
              minLength={8}
            />
          </label>

          <label className="block text-sm font-medium text-neutral-200">
            Confirmar senha
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
              placeholder="Repita a senha"
              autoComplete="new-password"
              minLength={8}
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
            {isSubmitting ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Já tem acesso?{" "}
          <Link href="/login" className="text-yellow-300 hover:text-yellow-200">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
