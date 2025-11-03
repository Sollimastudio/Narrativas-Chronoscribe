// ARQUIVO: src/app/dashboard/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiBook,
  FiFileText,
  FiShare2,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import { useEffect, useMemo, useState } from 'react';
import { ContentCreator } from '@/components/workspace/ContentCreator';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const firstName = useMemo(() => {
    const fullName = session?.user?.name;
    if (!fullName) return session?.user?.email ?? 'criador(a)';
    return fullName.split(' ')[0] ?? fullName;
  }, [session?.user?.email, session?.user?.name]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/50 px-6 py-4 text-sm">
          <span className="h-3 w-3 animate-pulse rounded-full bg-amber-300" />
          Preparando o painel estratégico...
        </div>
      </div>
    );
  }

  if (showCreator) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center bg-slate-950/95 px-4 py-10 text-slate-100 sm:px-6 lg:px-10">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#1e3a8a22,transparent_65%)]"
          aria-hidden="true"
        />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
                Meta-agente L5
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-amber-100 sm:text-3xl">
                Arquiteto Mestre Escriba
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                Modele o briefing visceral, ative módulos de inteligência e gere narrativas com o funil estratégico completo.
              </p>
            </div>
            <Button
              onClick={() => setShowCreator(false)}
              variant="ghost"
              className="border border-slate-700/70 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 hover:border-amber-300 hover:bg-slate-900/60 hover:text-amber-200"
            >
              ← Voltar ao painel
            </Button>
          </div>
          <ContentCreator />
        </div>
      </div>
    );
  }

  const projectTypes = [
    {
      id: 'arquiteto',
      title: 'Arquiteto Mestre Escriba',
      headline: 'Assistente narrativo 100% visceral',
      description:
        'Pipeline completo com análise crítica, curadoria de estilo e exportação profissional.',
      icon: FiBook,
      accent: 'from-amber-400 via-amber-300 to-yellow-400',
      action: () => setShowCreator(true),
      featured: true,
      stats: [
        { label: 'Upload & análise', value: 'PDFs + links', emoji: '📚' },
        { label: 'Estilos narrativos', value: '16+ arsenais L5', emoji: '🎯' },
        { label: 'Análise crítica', value: 'Score visceral', emoji: '🧠' },
        { label: 'Exportação', value: 'PDF · DOCX · EPUB', emoji: '📤' },
      ],
    },
    {
      id: 'biografico',
      title: 'Drama Biográfico',
      description:
        'Roteiros intensos com montanha-russa emocional e cronologia garantida.',
      icon: FiBook,
      accent: 'from-fuchsia-400 via-violet-400 to-indigo-400',
      action: () => router.push('/narrativas/biografico'),
    },
    {
      id: 'artigo',
      title: 'Artigo Profissional',
      description: 'Estrutura editorial com pesquisa, dados e CTA estratégico.',
      icon: FiFileText,
      accent: 'from-sky-400 via-sky-500 to-cyan-400',
      action: () => setShowCreator(true),
    },
    {
      id: 'conteudo',
      title: 'Conteúdo para Redes',
      description: 'Sequências para reels, shorts e carrosséis de alto impacto.',
      icon: FiTrendingUp,
      accent: 'from-emerald-400 via-lime-300 to-teal-400',
      action: () => setShowCreator(true),
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-slate-950 text-slate-100">
      <div
        className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#1e293b,transparent_65%)] opacity-70"
        aria-hidden="true"
      />
      <div
        className="absolute right-[-10%] top-[-20%] -z-10 h-[28rem] w-[28rem] rounded-full bg-amber-500/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute left-[-12%] bottom-[-18%] -z-10 h-[26rem] w-[26rem] rounded-full bg-sky-500/15 blur-3xl"
        aria-hidden="true"
      />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6 lg:py-14">
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 rounded-3xl border border-slate-800/60 bg-slate-950/70 p-8 shadow-2xl shadow-blue-900/25 backdrop-blur-lg sm:p-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.6em] text-amber-300">
            Painel ChronoScribe
          </p>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-amber-100 sm:text-4xl">
                {firstName}, destrave sua narrativa de hoje
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Escolha o projeto ideal ou mergulhe direto no Meta-agente L5. Combine análise
                visceral com exportação profissional em poucos passos.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => setShowCreator(true)}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/30 hover:from-amber-300 hover:via-amber-200 hover:to-yellow-200"
              >
                <FiZap className="h-4 w-4" />
                Abrir Arquiteto Mestre
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-900/60 hover:text-slate-50"
              >
                <FiShare2 className="h-4 w-4" />
                Compartilhar briefing
              </Button>
            </div>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Narrativas</p>
              <p className="mt-2 text-xl font-semibold text-amber-200">0 em progresso</p>
              <p className="mt-1 text-xs text-slate-400">
                Salve rascunhos enquanto prototipa com o L5.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Equipe</p>
              <p className="mt-2 text-xl font-semibold text-amber-200">1 conta ativa</p>
              <p className="mt-1 text-xs text-slate-400">
                Convide colaboradores e compartilhe fluxos.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Exportações</p>
              <p className="mt-2 text-xl font-semibold text-amber-200">0 arquivos enviados</p>
              <p className="mt-1 text-xs text-slate-400">
                Gere PDF, EPUB, DOCX ou roteiros personalizados.
              </p>
            </div>
          </div>
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {projectTypes
            .filter((project) => project.featured)
            .map((project) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -4 }}
                onClick={project.action}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-amber-300/40 bg-slate-950/80 p-8 shadow-2xl shadow-amber-500/20 backdrop-blur"
              >
                <div
                  className={cn(
                    'absolute -right-16 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full opacity-50 blur-3xl transition-transform group-hover:translate-y-[-55%]',
                    `bg-gradient-to-br ${project.accent}`,
                  )}
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/80">
                    <project.icon className="h-8 w-8 text-amber-200" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-amber-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
                        Meta-agente
                      </span>
                      <h2 className="text-2xl font-semibold text-amber-100 sm:text-3xl">
                        {project.title}
                      </h2>
                    </div>
                    <p className="text-sm text-slate-200 sm:text-base">
                      {project.headline}
                    </p>
                    <p className="text-sm text-slate-300">{project.description}</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {project.stats?.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-amber-400/20 bg-amber-400/5 px-3 py-3 text-xs text-amber-100"
                        >
                          <p className="font-semibold text-amber-200">
                            {item.emoji} {item.label}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}

          <aside className="space-y-4 rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 shadow-2xl shadow-blue-900/25 backdrop-blur">
            <h3 className="text-lg font-semibold text-amber-100">Insights rápidos</h3>
            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
                <div className="flex items-center gap-3 text-slate-200">
                  <FiUsers className="h-4 w-4 text-amber-200" />
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Personas-alvo
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  Repare nas tendências de engajamento: o L5 prioriza pautas biográficas e
                  jornadas de ruptura nesta semana.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
                <div className="flex items-center gap-3 text-slate-200">
                  <FiTrendingUp className="h-4 w-4 text-amber-200" />
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Próxima ação
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  Configure um briefing curto com o módulo crítico ativado para medir o score
                  visceral antes da campanha.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreator(true)}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/25 hover:from-amber-300 hover:via-amber-200 hover:to-yellow-200"
            >
              Iniciar meta-agente L5
            </Button>
          </aside>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {projectTypes
            .filter((project) => !project.featured)
            .map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                onClick={project.action}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 shadow-xl shadow-blue-900/20 backdrop-blur"
              >
                <div
                  className={cn(
                    'absolute -right-16 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full opacity-40 blur-3xl transition-transform group-hover:translate-y-[-55%]',
                    `bg-gradient-to-br ${project.accent}`,
                  )}
                  aria-hidden="true"
                />
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/70">
                    <project.icon className="h-6 w-6 text-amber-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-100">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">{project.description}</p>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
                      Iniciar projeto
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber-400/40 text-[11px]">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
        </section>
      </main>
    </div>
  );
}
