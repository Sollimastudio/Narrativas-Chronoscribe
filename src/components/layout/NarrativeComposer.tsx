"use client";

import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Briefing = {
  titulo: string;
  publicoAlvo: string;
  objetivoEstrategico: string;
  modeloEscrita: string;
  produtoDesejado: string;
  ctaFunil: string;
  contextoPrincipal: string;
  fontesExternas: string;
};

type ExpertiseState = {
  criticoAnalitico: boolean;
  direcaoArte: boolean;
};

const selectClasses =
  "mt-1 block w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-100 shadow-sm transition-colors placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50";

const STRATEGIC_OBJECTIVES = [
  { value: "Vendas", label: "Vender Livro/Produto" },
  { value: "Engajamento", label: "Engajamento e Viralização" },
  { value: "Lancamento", label: "Lançamento de Produto/Serviço" },
  { value: "Reconhecimento", label: "Autoridade e Reconhecimento" },
];

const WRITING_MODELS = [
  { value: "CronistaIrreverente", label: "O Cronista Irreverente (Humor Ácido)" },
  { value: "AnalistaFrigido", label: "O Analista Frígido (Economia/Finanças)" },
  { value: "PortalAreia", label: "O Portal de Areia (Educação Sensorial)" },
  { value: "ManifestoRuptura", label: "O Manifesto da Ruptura (Ativismo)" },
  { value: "MestreZen", label: "A Voz do Mestre Zen (Mindfulness)" },
  { value: "GritoHacker", label: "O Grito do Hacker (Tecnologia/Inovação)" },
  { value: "GuiaSobrevivencia", label: "O Guia de Sobrevivência (Performance/Disciplina)" },
  { value: "CuradorHistorias", label: "O Curador de Histórias (Documental/Biografia)" },
  { value: "EspelhoQuebrado", label: "O Espelho Quebrado (Psicologia Sombria)" },
  { value: "CartaIntima", label: "A Carta Íntima (E-mails/Vendas confidenciais)" },
];

const DELIVERABLES = [
  { value: "Livro300", label: "Livro ou Ebook (mínimo 300 páginas)" },
  { value: "VideoLongo", label: "Roteiro para Vídeo Longo (Netflix/YouTube)" },
  { value: "CarrosselViral", label: "Carrossel/Reels/Shorts (100% viral)" },
  { value: "ArtigoBlog", label: "Artigo para Blog/Newsletter" },
];

const CTAS = [
  { value: "ComenteBonus", label: "Comentário + Entrega de Bônus" },
  { value: "SigaECompartilhe", label: "Siga, Curta e Compartilhe" },
  { value: "LinkNaBio", label: "Direcionar para Link na Bio" },
  { value: "PerguntaVisceral", label: "Pergunta Reflexiva/Visceral" },
];

const EXPERTISE_OPTIONS: Array<{
  key: keyof ExpertiseState;
  title: string;
  description: string;
  badge: string;
}> = [
  {
    key: "criticoAnalitico",
    title: "Crítico & Analítico",
    description: "Score visceral, revisão de gaps narrativos e aderência PNL.",
    badge: "100% VISCERAL",
  },
  {
    key: "direcaoArte",
    title: "Direção de Arte",
    description: "Prompts coesos para imagem, carrossel e storytelling visual.",
    badge: "PROMPTS COESOS",
  },
];

const INITIAL_BRIEFING: Briefing = {
  titulo: "",
  publicoAlvo: "",
  objetivoEstrategico: "",
  modeloEscrita: "",
  produtoDesejado: "",
  ctaFunil: "",
  contextoPrincipal: "",
  fontesExternas: "",
};

const INITIAL_EXPERTISE: ExpertiseState = {
  criticoAnalitico: false,
  direcaoArte: false,
};

export default function NarrativeComposer() {
  const [briefing, setBriefing] = useState<Briefing>(INITIAL_BRIEFING);
  const [expertise, setExpertise] = useState<ExpertiseState>(INITIAL_EXPERTISE);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setBriefing((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const toggleExpertise = (key: keyof ExpertiseState) => {
    setExpertise((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = useCallback(async () => {
    setError(null);

    if (!briefing.objetivoEstrategico || !briefing.produtoDesejado) {
      setError("Defina o objetivo estratégico e o produto final antes de gerar.");
      return;
    }

    setIsGenerating(true);

    try {
      console.log("Iniciando a Análise L5. Enviando Briefing:", briefing);
      console.log("Expertise selecionada:", expertise);
      console.log("Requisição de geração enviada...");
      // A integração real com /api/narratives deve ser implementada no backend.
    } catch (err) {
      console.error("Erro ao gerar narrativa:", err);
      setError(
        "ERRO CRÍTICO NO BACKEND. Verifique o terminal para erros de PostgreSQL/Gemini API Key."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [briefing, expertise]);

  const summaryItems = useMemo(
    () => [
      { label: "Título do projeto", value: briefing.titulo || "—" },
      { label: "Público-alvo", value: briefing.publicoAlvo || "—" },
      {
        label: "Objetivo estratégico",
        value:
          STRATEGIC_OBJECTIVES.find((item) => item.value === briefing.objetivoEstrategico)
            ?.label ?? "—",
      },
      {
        label: "Modelo de escrita L5",
        value: WRITING_MODELS.find((item) => item.value === briefing.modeloEscrita)?.label ?? "—",
      },
      {
        label: "Produto final",
        value: DELIVERABLES.find((item) => item.value === briefing.produtoDesejado)?.label ?? "—",
      },
      {
        label: "CTA",
        value: CTAS.find((item) => item.value === briefing.ctaFunil)?.label ?? "—",
      },
    ],
    [briefing]
  );

  const activeExpertise = useMemo(
    () =>
      EXPERTISE_OPTIONS.filter((option) => expertise[option.key]).map(
        ({ title, badge }) => ({ title, badge })
      ),
    [expertise]
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-slate-950/95 px-4 py-10 text-slate-100 sm:px-6 lg:px-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#1e3a8a22,transparent_65%)]"
        aria-hidden="true"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-amber-300">
            Meta-agente L5
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-amber-100 md:text-4xl">
                Funil Estratégico de Narrativas
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 md:text-base">
                Estruture rapidamente o briefing 100% visceral. Defina objetivo, tom de voz,
                público, materiais de apoio e ative módulos de inteligência para liberar a
                geração analítica.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs font-medium text-amber-200">
              <span className="block text-[11px] uppercase tracking-[0.4em] text-amber-300/80">
                Status
              </span>
              Meta-agente pronto para sintetizar
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="space-y-8 rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 shadow-xl shadow-blue-900/20 backdrop-blur lg:p-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-amber-200 md:text-xl">
                1. Encomenda estratégica
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título do projeto</Label>
                  <Input
                    id="titulo"
                    name="titulo"
                    value={briefing.titulo}
                    onChange={handleChange}
                    placeholder="Ex.: Saga Biográfica da Sol Lima"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publicoAlvo">Público-alvo</Label>
                  <Input
                    id="publicoAlvo"
                    name="publicoAlvo"
                    value={briefing.publicoAlvo}
                    onChange={handleChange}
                    placeholder="Ex.: Mulheres 30+ em fase de ruptura"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="objetivoEstrategico">Objetivo estratégico</Label>
                  <select
                    id="objetivoEstrategico"
                    name="objetivoEstrategico"
                    value={briefing.objetivoEstrategico}
                    onChange={handleChange}
                    className={selectClasses}
                  >
                    <option value="">Selecione o resultado desejado</option>
                    {STRATEGIC_OBJECTIVES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modeloEscrita">Modelo de escrita L5</Label>
                  <select
                    id="modeloEscrita"
                    name="modeloEscrita"
                    value={briefing.modeloEscrita}
                    onChange={handleChange}
                    className={selectClasses}
                  >
                    <option value="">Selecione o arquétipo de escrita</option>
                    {WRITING_MODELS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="produtoDesejado">Produto final principal</Label>
                  <select
                    id="produtoDesejado"
                    name="produtoDesejado"
                    value={briefing.produtoDesejado}
                    onChange={handleChange}
                    className={selectClasses}
                  >
                    <option value="">Escolha o formato principal</option>
                    {DELIVERABLES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ctaFunil">Chamada para ação (CTA)</Label>
                  <select
                    id="ctaFunil"
                    name="ctaFunil"
                    value={briefing.ctaFunil}
                    onChange={handleChange}
                    className={selectClasses}
                  >
                    <option value="">Selecione a ação desejada</option>
                    {CTAS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5">
              <h2 className="text-lg font-semibold text-amber-200 md:text-xl">
                2. Contexto & fontes de dados
              </h2>

              <div className="space-y-2">
                <Label htmlFor="contextoPrincipal">
                  Resumo da história ou tema principal
                </Label>
                <Textarea
                  id="contextoPrincipal"
                  name="contextoPrincipal"
                  value={briefing.contextoPrincipal}
                  onChange={handleChange}
                  rows={4}
                  placeholder='Ex.: "Minha trajetória de 10 anos em lançamentos digitais com foco em economia criativa."'
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontesExternas">
                  Links, PDFs, vídeos e materiais de apoio
                </Label>
                <Textarea
                  id="fontesExternas"
                  name="fontesExternas"
                  value={briefing.fontesExternas}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Coloque um item por linha. Ex.: https://youtu.be/... — Aula sobre narrativa visceral."
                />
                <p className="text-xs text-slate-400">
                  O Meta-agente fará a análise cronológica completa dos materiais enviados.
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5">
              <h2 className="text-lg font-semibold text-amber-200 md:text-xl">
                3. Ativar módulos de expertise
              </h2>
              <p className="text-sm text-slate-400">
                Personalize a atuação do Meta-agente L5 marcando os módulos desejados. Você pode
                combinar os dois para um pipeline completo.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {EXPERTISE_OPTIONS.map((option) => {
                  const isActive = expertise[option.key];
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => toggleExpertise(option.key)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
                        isActive
                          ? "border-amber-400/60 bg-amber-500/15 shadow-lg shadow-amber-500/30"
                          : "border-slate-800/70 bg-slate-950/60 hover:border-amber-400/40 hover:bg-slate-900/60"
                      }`}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300">
                        {option.badge}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold text-amber-100">
                        {option.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-300">{option.description}</p>
                      {isActive && (
                        <span className="mt-3 inline-flex rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200">
                          módulo ativado
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                Aviso crítico L5: {error}
              </div>
            )}

            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-amber-400/30 transition-transform hover:-translate-y-[1px] hover:from-amber-300 hover:via-amber-200 hover:to-yellow-300 disabled:opacity-70"
            >
              {isGenerating ? "Gerando narrativa..." : "Gerar narrativa visceral"}
            </Button>
          </section>

          <aside className="space-y-6 rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 shadow-xl shadow-blue-900/20 backdrop-blur lg:p-8">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-amber-100">Painel de briefing</h2>
              <p className="text-sm text-slate-400">
                Resumo dinâmico para validar rapidamente antes de acionar o meta-agente.
              </p>
            </div>

            <dl className="space-y-4 text-sm">
              {summaryItems.map((item) => (
                <div key={item.label} className="space-y-1 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                    {item.label}
                  </dt>
                  <dd className="text-sm text-slate-100">{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="space-y-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm text-amber-100">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-200/80">
                Expertise ativa
              </p>
              {activeExpertise.length === 0 ? (
                <p className="text-sm text-amber-100/80">
                  Nenhum módulo selecionado. Ative pelo menos um para destravar análises críticas
                  ou direção de arte.
                </p>
              ) : (
                <ul className="space-y-2">
                  {activeExpertise.map((item) => (
                    <li key={item.title} className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
                        {item.badge}
                      </p>
                      <p className="text-sm font-semibold text-amber-100">{item.title}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 text-xs text-slate-400">
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-500">
                Checklist pré-meta
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
                  Confirme se objetivo e produto final estão definidos.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
                  Revise o resumo e os materiais de apoio carregados.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
                  Ative os módulos de expertise desejados para o contexto atual.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
