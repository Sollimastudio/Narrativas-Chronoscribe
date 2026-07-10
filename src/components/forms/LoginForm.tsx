"use client";

import { FormEvent, useMemo, useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const SIGN_IN_ERRORS: Record<string, string> = {
  CredentialsSignin: "Credenciais inválidas. Verifique e tente novamente.",
  SessionRequired: "Faça login para acessar esta página.",
};

function LoginFormContent() {
  const params = useSearchParams();

  const callbackUrl = useMemo(
    () => params?.get("callbackUrl") ?? "/dashboard",
    [params]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl,
      });

      if (!result) {
        setError("Não foi possível conectar. Tente novamente.");
        return;
      }

      if (result.error) {
        setError(SIGN_IN_ERRORS[result.error] ?? result.error);
        return;
      }
    } catch (err) {
      console.error("Erro ao autenticar:", err);
      setError("Erro inesperado. Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          placeholder="voce@chronoscribe.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          autoComplete="current-password"
          placeholder="********"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:bg-amber-400/70"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="text-center text-slate-400">Carregando...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
