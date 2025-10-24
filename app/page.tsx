"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type FilePreview = {
  name: string;
  snippet: string;
  error?: string;
};

const NICHOS = [
  "Desenvolvimento Pessoal",
  "Marketing Digital",
  "Finanças e Investimentos",
  "Saúde e Bem-estar",
  "Educação e Aprendizagem",
  "Tecnologia e Inovação",
];

const ESTILOS = [
  "A Confissão Visceral",
  "O Blueprint do Mestre",
  "A Jornada do Herói Relutante",
  "O Manifesto Visionário",
  "A Fábula Científica",
];

const OBJETIVOS = [
  "Vendas",
  "Engajamento",
  "Educação",
  "Autoridade",
  "Crescimento de Seguidores",
  "Lançamento",
];

const TAREFAS = [
  "Gerar Estrutura de Livro",
  "Gerar Roteiro para YouTube",
  "Fazer Diagnóstico Estratégico",
  "Gerar Prompt de Imagem (Direção de Arte)",
  "Criar Artigo SEO Otimizado",
  "Planejar Sequência de E-mails",
  "Criar Calendário Editorial Multicanal",
];

const MAX_SNIPPET_CHARS = 1200;

function isProbablyTextFile(file: File) {
  if (file.type.startsWith("text/")) return true;
  return /\.(txt|md|csv|json|html|xml)$/i.test(file.name);
}

async function readFileSafely(file: File): Promise<FilePreview> {
  if (!isProbablyTextFile(file)) {
    return {
      name: file.name,
      snippet:
        "Conteúdo não processado automaticamente (formato binário ou PDF). Descreva manualmente no campo de texto para contextualizar a IA.",
    };
  }

  try {
    const content = await file.text();
    const normalized = content.replace(/\s+/g, " ").trim();
    const snippet =
      normalized.length > MAX_SNIPPET_CHARS
        ? `${normalized.slice(0, MAX_SNIPPET_CHARS)}…`
        : normalized;
    return { name: file.name, snippet };
  } catch (error) {
    return {
      name: file.name,
      snippet: "",
      error:
        error instanceof Error
          ? `Falha ao ler arquivo: ${error.message}`
          : "Falha ao ler arquivo.",
    };
  }
}

export default function ChronoscribePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [link, setLink] = useState("");
  const [contextText, setContextText] = useState("");
  const [nicho, setNicho] = useState("");
  const [estilo, setEstilo] = useState("");
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [tarefa, setTarefa] = useState("");
  const [extraInstrucoes, setExtraInstrucoes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleObjetivoToggle = useCallback((item: string) => {
    setObjetivos((prev) =>
      prev.includes(item)
        ? prev.filter((objetivo) => objetivo !== item)
        : [...prev, item]
    );
  }, []);

  const handleFilePick = useCallback(async (selection: FileList | null) => {
    if (!selection) return;
    const fileArray = Array.from(selection);
    setFiles(fileArray);

    const previews = await Promise.all(fileArray.map((file) => readFileSafely(file)));
    setFilePreviews(previews);
  }, []);

  const superPrompt = useMemo(
    () =>
      [
        'Você é o "Arquiteto de Narrativas", estrategista definitivo em engenharia de best-sellers e dinâmica viral.',
        "",
        "Regras de atuação:",
        "1. Linguagem precisa, ousada e visual. Misture termos estratégicos com sensações narrativas.",
        "2. Estruture sempre em Markdown com seções claras, listas e destaques que permitam ação imediata.",
        "3. Garanta aderência absoluta ao(s) objetivo(s) do usuário.",
        "4. Organize fatos em linha temporal consistente sempre que houver cronologia.",
        "5. Seja específico, nunca genérico; entregue frameworks, ângulos e assets reutilizáveis.",
        "6. Quando solicitado 'Gerar Prompt de Imagem', produza um prompt profissional (Midjourney/DALL·E) com descrição de cena, estilo, iluminação, tom emocional e parâmetros extras.",
      ].join("\n"),
    []
  );

  const promptParaIA = useMemo(() => {
    const arquivosFormatted = filePreviews
      .map((item) => {
        const header = `### Arquivo: ${item.name}`;
        if (item.error) {
          return `${header}\nStatus: ${item.error}`;
        }
        return `${header}\nConteúdo (parcial): ${item.snippet || "—"}`;
      })
      .join("\n\n");

    return [
      "### Contexto Bruto",
      arquivosFormatted || "Nenhum arquivo processado.",
      `Link de referência: ${link || "Nenhum"}`,
      `Texto fornecido: ${contextText || "Nenhum"}`,
      "",
      "### Estratégia Definida",
      `Nicho: ${nicho || "Não selecionado"}`,
      `Estilo Narrativo: ${estilo || "Não selecionado"}`,
      `Objetivos principais: ${objetivos.length ? objetivos.join(", ") : "Não definidos"}`,
      "",
      "### Tarefa Solicitada",
      `Ação: ${tarefa || "Não selecionada"}`,
      extraInstrucoes ? `Instruções adicionais: ${extraInstrucoes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [filePreviews, link, contextText, nicho, estilo, objetivos, tarefa, extraInstrucoes]);

  const isReadyToGenerate = useMemo(() => {
    if (!tarefa) return false;
    const hasContext =
      filePreviews.length > 0 ||
      Boolean(link.trim()) ||
      Boolean(contextText.trim());
    return hasContext && Boolean(nicho) && Boolean(estilo) && objetivos.length > 0;
  }, [filePreviews.length, link, contextText, nicho, estilo, objetivos, tarefa]);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setResult("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          superPrompt,
          promptParaIA,
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      const isJson = contentType.includes("application/json");
      const payload = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        if (isJson && payload && typeof payload === "object") {
          const { error, details } = payload as {
            error?: string;
            details?: string;
          };
          throw new Error(
            error
              ? `${error}${details ? ` — ${details}` : ""}`
              : `Erro na API: ${response.status} ${response.statusText}`
          );
        }

        throw new Error(
          typeof payload === "string" && payload.trim()
            ? payload
            : `Erro na API: ${response.status} ${response.statusText}`
        );
      }

      const text = isJson
        ? (payload as { result?: string; data?: string })?.result ??
          (payload as { result?: string; data?: string })?.data ??
          JSON.stringify(payload, null, 2)
        : (payload as string);
      setResult(text);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado ao gerar conteúdo.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [promptParaIA, superPrompt]);

  return (
    <div className="min-h-screen bg-neutral-950 pb-20 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-yellow-400 md:text-4xl">
              Narrativas Chronoscribe
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-400 md:text-base">
              O Arquiteto de Narrativas transforma caos mental em frameworks, cronologias e ativos
              criativos prontos para publicação. Forneça contexto, defina a estratégia e execute.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 text-xs uppercase tracking-wide text-neutral-500 md:text-right">
            <span>Motor: Gemini 1.5 Pro (Vertex AI)</span>
            <span>Contexto estendido · Direção de arte · Produção multimídia</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 pt-8 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 shadow-lg shadow-black/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-yellow-200">Passo 1 · Contexto</h2>
              <button
                type="button"
                className="rounded-lg border border-yellow-500/30 px-3 py-1 text-xs text-yellow-200 transition hover:border-yellow-400 hover:text-yellow-300"
                onClick={() => fileInputRef.current?.click()}
              >
                Anexar arquivos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => handleFilePick(event.target.files)}
              />
            </div>

            {filePreviews.length > 0 && (
              <div className="mt-4 space-y-3 rounded-xl border border-neutral-800 bg-neutral-950/70 p-4">
                {filePreviews.map((preview) => (
                  <article key={preview.name} className="space-y-1 text-sm">
                    <header className="flex items-center justify-between">
                      <span className="font-medium text-neutral-100">{preview.name}</span>
                      <span className="text-xs text-neutral-500">
                        {preview.error ? "Falha na leitura" : "Prévia parcial"}
                      </span>
                    </header>
                    <p className="whitespace-pre-wrap rounded-lg border border-neutral-800 bg-neutral-900/80 p-3 text-neutral-300">
                      {preview.error ? preview.error : preview.snippet}
                    </p>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-neutral-200">
                Link de referência
                <input
                  className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                  placeholder="Cole a URL do conteúdo base"
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                />
              </label>

              <label className="block text-sm font-medium text-neutral-200">
                Texto bruto / observações
                <textarea
                  className="mt-2 h-40 w-full resize-y rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                  placeholder="Cole trechos, anotações ou resuma o conteúdo dos arquivos. Quanto mais contexto, melhor."
                  value={contextText}
                  onChange={(event) => setContextText(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-lg shadow-black/50">
            <h2 className="text-xl font-semibold text-yellow-200">Passo 2 · Estratégia</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-neutral-200">
                Nicho de atuação
                <select
                  className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                  value={nicho}
                  onChange={(event) => setNicho(event.target.value)}
                >
                  <option value="">Selecione</option>
                  {NICHOS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-neutral-200">
                Estilo de impacto narrativo
                <select
                  className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                  value={estilo}
                  onChange={(event) => setEstilo(event.target.value)}
                >
                  <option value="">Selecione</option>
                  {ESTILOS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-neutral-200">
                Objetivos principais da peça
              </p>
              <div className="flex flex-wrap gap-2">
                {OBJETIVOS.map((item) => {
                  const active = objetivos.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleObjetivoToggle(item)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? "border-yellow-400 bg-yellow-400/20 text-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.35)]"
                          : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800/80"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-6 block text-sm font-medium text-neutral-200">
              Diretrizes extras
              <textarea
                className="mt-2 h-28 w-full resize-y rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                placeholder="Inclua exigências específicas (tom de voz, referências obrigatórias, CTA, métricas de sucesso esperadas etc.)."
                value={extraInstrucoes}
                onChange={(event) => setExtraInstrucoes(event.target.value)}
              />
            </label>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-lg shadow-black/50">
            <h2 className="text-xl font-semibold text-yellow-200">Passo 3 · Execução</h2>

            <label className="mt-6 block text-sm font-medium text-neutral-200">
              Escolha a ação do Arquiteto
              <select
                className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                value={tarefa}
                onChange={(event) => setTarefa(event.target.value)}
              >
                <option value="">Selecione uma tarefa</option>
                {TAREFAS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              disabled={!isReadyToGenerate || isLoading}
              onClick={handleGenerate}
              className="mt-6 w-full rounded-xl border border-yellow-500/40 bg-yellow-400/20 px-6 py-3 text-lg font-semibold text-yellow-200 transition hover:bg-yellow-400/30 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:bg-neutral-900 disabled:text-neutral-500"
            >
              {isLoading ? "Gerando com o Arquiteto…" : "Executar tarefa agora"}
            </button>

            {!isReadyToGenerate && (
              <p className="mt-3 text-xs text-neutral-500">
                Forneça pelo menos um contexto, escolha nicho, estilo, objetivos e a tarefa
                desejada.
              </p>
            )}
          </div>
        </section>

        <section className="flex h-full flex-col gap-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-lg shadow-black/50">
            <h2 className="text-xl font-semibold text-yellow-200">
              Resultado do Arquiteto
            </h2>
            <div className="mt-4 min-h-[320px] rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-sm text-neutral-200">
              {isLoading && <p className="animate-pulse text-yellow-300">Orquestrando a narrativa...</p>}
              {!isLoading && errorMessage && (
                <p className="text-red-400">Erro: {errorMessage}</p>
              )}
              {!isLoading && !errorMessage && result && (
                <article className="prose prose-invert max-w-none text-neutral-100">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-200">
                    {result}
                  </pre>
                </article>
              )}
              {!isLoading && !errorMessage && !result && (
                <p className="text-neutral-500">
                  Configure os três passos e execute a tarefa para receber a entrega completa
                  (estruturas, prompts, assets e planos de ação).
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-xs text-neutral-400">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-300">
              Diagnóstico instantâneo
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-neutral-500">Status:</span>{" "}
                {isReadyToGenerate ? "Pronto para executar" : "Aguardando parâmetros obrigatórios"}
              </li>
              <li>
                <span className="text-neutral-500">Objetivos ativos:</span>{" "}
                {objetivos.length ? objetivos.join(" · ") : "Nenhum selecionado"}
              </li>
              <li>
                <span className="text-neutral-500">Arquivos anexados:</span>{" "}
                {files.length ? files.map((file) => file.name).join(" · ") : "Nenhum"}
              </li>
              <li>
                <span className="text-neutral-500">Contexto textual:</span>{" "}
                {contextText ? `${contextText.length} caracteres` : "Não informado"}
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 text-xs text-neutral-500">
            <p>
              Dica: para direção de arte completa, utilize a tarefa{" "}
              <strong>Gerar Prompt de Imagem (Direção de Arte)</strong> e em seguida alimente o
              prompt em um gerador de imagem compatível (Imagen, Midjourney, DALL·E).
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
