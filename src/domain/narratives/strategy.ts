import {
  NarrativeBlueprint,
  NarrativeGenerationContext,
} from "@/domain/narratives/blueprint";

function renderSections(blueprint: NarrativeBlueprint) {
  return blueprint.sections
    .map((section, index) => {
      const highlights =
        section.highlights && section.highlights.length > 0
          ? `Highlights:\n${section.highlights
              .map((item) => `- ${item}`)
              .join("\n")}\n`
          : "";
      return [
        `### ${index + 1}. ${section.title}`,
        `Objetivo: ${section.objective}`,
        highlights,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function instructionsForLength(length: NarrativeBlueprint["lengthGuidance"]) {
  switch (length) {
    case "short":
      return "Produza uma entrega concisa (400-600 palavras).";
    case "longform":
      return "Produza um material completo (1200-1600 palavras) com profundidade estratégica.";
    default:
      return "Produza um material de profundidade média (700-1000 palavras).";
  }
}

export function buildSystemPrompt(context: NarrativeGenerationContext) {
  const { blueprint, brandVoice, language } = context;

  const voice = brandVoice
    ? `Combine o tom ${blueprint.tone} com a voz de marca a seguir:\n${brandVoice}\n`
    : `Utilize um tom ${blueprint.tone}.`;

  const existingDirectives = [
    "Você é o Meta-Agente L5, especialista em arquitetura narrativa.",
    "Aja como roteirista senior e estrategista, convertendo briefings em narrativas que conectam público e objetivo.",
    `Idioma de saída obrigatório: ${language}.`,
    voice,
    instructionsForLength(blueprint.lengthGuidance),
    "Garanta consistência de voz, coerência lógica e ritmo envolvente.",
  ].join("\n");

  let newDirectives = `
*** DIRETIVA CHRONOSCRIBE: MESTRE ESCRIBA VISCERAL ***
O objetivo final é gerar conteúdo que VENDA (ideias, posicionamento, engajamento, produtos). A venda é a ativação de um desejo ou a ressignificação de uma dor. O resultado deve ser IMPOSSÍVEL DE SER IGNORADO.

**PROTOCOLO DE ESTUDO MULTIMÍDIA E CONTEXTO:**
1.  **PDFs/Links (Texto):** Você DEVE absorver, discernir e usar o conteúdo principal para aprendizado biográfico e profundo, garantindo a **cronologia dos fatos** como espinha dorsal narrativa.
2.  **Imagens/Vídeos (Mídia):** Você DEVE analisar o estilo, a emoção, o tom de voz e o posicionamento contido em todo material multimídia anexado. Sua escrita deve ser COESA com o visual estudado.
  `;

  if (blueprint.acaoCritico) {
    newDirectives += `
**APLICAÇÃO DO NOVO BOTÃO CRÍTICO/ANALÍTICO/VISCERAL:**
- Antes de gerar o conteúdo final (ou após a primeira versão), você DEVE aplicar uma análise crítica do tema, formato e estilo escolhidos.
- O campo 'sugestoesViralizacao' na saída JSON deve conter **sugestões de melhoria** (ex: "O formato X é o ideal, mas adicione a música Y para maior viralização") para maximizar o impacto, o engajamento MIL e a vendabilidade do conteúdo.
`;
  }

  if (blueprint.acaoDiretorArte) {
    newDirectives += `
**DIREÇÃO DE ARTE E DESIGN TOTAL (Zero Ignorância Visual):**
- Se a flag 'acaoDiretorArte' for TRUE, você DEVE gerar prompts ultra-profissionais e impossíveis de serem ignorados.
- O estilo visual é sempre: **Alto Contraste, Paleta: Preto, Dourado, Bege e Branco, com Metáforas Sensoriais.**
- **Sequência de Carrossel:** Se 'numImagensCarrossel' for definido, o campo 'promptCarrossel' DEVE ser preenchido com prompts sequenciais (1 para cada slide) que contam a história ou constroem a tensão visualmente.
`;
  }

  return existingDirectives + newDirectives;
}

export function buildUserPrompt(context: NarrativeGenerationContext) {
  const { blueprint, format } = context;

  const sections = renderSections(blueprint);

  const formatInstruction =
    format === "json"
      ? "Responda em JSON com chaves: title, synopsis, sections[].title, sections[].content, cta, analisePreditiva.sugestoesCriticas, analisePreditiva.sugestoesViralizacao, promptImagem, promptCarrossel."
      : format === "markdown"
      ? "Formate a saída em Markdown com títulos claros e subtítulos para cada seção."
      : "Retorne texto puro bem estruturado.";

  const callToAction = blueprint.callToAction
    ? `Call to action desejado: ${blueprint.callToAction}`
    : "";

  const multimediaContext = [
    `Contexto de Links para Estudo: ${blueprint.linksURLs?.join(", ") || 'Nenhum link anexado.'}`,
    `Contexto de PDFs para Estudo: ${blueprint.arquivosPDFs || 'Nenhum PDF anexado.'}`,
    `Contexto Multimídia para Estudo: ${blueprint.arquivosMIdia || 'Nenhum material multimídia anexado.'}`,
    `Ação Diretor de Arte Requerida: ${blueprint.acaoDiretorArte ? 'SIM' : 'NÃO'}`,
    `Ação Crítico/Analítico Requerida: ${blueprint.acaoCritico ? 'SIM' : 'NÃO'}`,
    `Número de Imagens Carrossel: ${blueprint.numImagensCarrossel || 'N/A'}`
  ].join('\n');

  return [
    `Título do projeto: ${blueprint.title}`,
    `Público-alvo principal: ${blueprint.audience}`,
    `Objetivo estratégico: ${blueprint.objective}`,
    `Resumo essencial: ${blueprint.summary}`,
    `Formato: ${blueprint.medium}`,
    formatInstruction,
    callToAction,
    "--- CONTEXTO DO BRIEFING ---",
    multimediaContext,
    "--- ESTRUTURA SUGERIDA ---",
    sections,
  ]
    .filter(Boolean)
    .join("\n\n");
}
