/**
 * PERSUASIVE PROMPTS - Sistema de Geração de Prompts Persuasivos
 * 
 * Gera prompts otimizados para cada tipo de conteúdo usando a Constituição
 */

import {
  getFullConstitution,
  ContentType,
  ConversionObjective,
  NarrativeStyle,
} from './constitution';

export interface PromptContext {
  contentType: ContentType;
  objectives: ConversionObjective[];
  style: NarrativeStyle;
  sourceContent: string;
  audience?: string;
  brandVoice?: string;
  additionalContext?: string;
}

/**
 * Constrói o System Prompt incorporando a Constituição
 */
export function buildPersuasiveSystemPrompt(context: PromptContext): string {
  const constitution = getFullConstitution();
  
  const styleInstructions = getStyleInstructions(context.style);
  const contentTypeInstructions = getContentTypeInstructions(context.contentType);
  const objectiveInstructions = getObjectiveInstructions(context.objectives);

  const brandVoiceSection = context.brandVoice
    ? `\n\nVOZ DA MARCA:\n${context.brandVoice}`
    : '';

  return `${constitution}

${styleInstructions}

${contentTypeInstructions}

${objectiveInstructions}${brandVoiceSection}

REGRAS ABSOLUTAS:
1. Todo conteúdo deve ser IMPOSSÍVEL DE SER IGNORADO
2. Use linguagem visceral, não clichês vazios
3. Cada frase deve ter propósito estratégico
4. Construa tensão progressiva que leva à ação
5. Sempre pense: "Isso converte?"
`;
}

/**
 * Constrói o User Prompt específico para o tipo de conteúdo
 */
export function buildPersuasiveUserPrompt(context: PromptContext): string {
  const { contentType, sourceContent, audience, additionalContext } = context;

  const audienceSection = audience 
    ? `\n\nPÚBLICO-ALVO:\n${audience}`
    : '';

  const additionalSection = additionalContext
    ? `\n\nCONTEXTO ADICIONAL:\n${additionalContext}`
    : '';

  const contentSpecific = getContentTypeUserPrompt(contentType);

  return `${contentSpecific}${audienceSection}${additionalSection}

MATERIAL BASE PARA TRANSFORMAÇÃO:
${sourceContent}

TAREFA:
Transforme o material acima em ${contentType.toUpperCase()} persuasivo, seguindo rigorosamente a Constituição e os módulos de PNL, UCG e Storytelling.
Não apenas resuma - RECONSTRUA com poder estratégico.
`;
}

/**
 * Instruções específicas por estilo narrativo
 */
function getStyleInstructions(style: NarrativeStyle): string {
  const styles: Record<NarrativeStyle, string> = {
    'montanha-russa': `
ESTILO: MONTANHA-RUSSA DA VIRALIDADE
- Alterne entre TENSÃO EXTREMA e ALÍVIO CATÁRTICO
- Use quebras de padrão constantes
- Crie ganchos emocionais a cada 2-3 parágrafos
- Ritmo acelerado, frases curtas quando a tensão sobe
- Pausas dramáticas antes de revelações
- NUNCA seja previsível
`,
    'executivo': `
ESTILO: EXECUTIVO ESTRATÉGICO
- Autoridade sem arrogância
- Dados concretos apoiando cada afirmação
- Linguagem direta mas sofisticada
- Frameworks claros e acionáveis
- ROI sempre visível
- Tom: "Eu entendo seu tempo é valioso"
`,
    'poetico': `
ESTILO: POÉTICO METAFÓRICO
- Use metáforas sensoriais poderosas
- Crie imagens mentais vívidas
- Ritmo e musicalidade nas frases
- Linguagem elevada mas acessível
- Transforme conceitos em experiências
- Apelo emocional profundo
`,
    'academico': `
ESTILO: ACADÊMICO FUNDAMENTADO
- Base em pesquisas e estudos
- Argumentação lógica impecável
- Vocabulário técnico quando apropriado
- Estrutura clara: tese → argumentos → conclusão
- Credibilidade através de fontes
- Tom professoral mas engajante
`,
    'storytelling': `
ESTILO: STORYTELLING NARRATIVO
- Estrutura de Jornada do Herói
- Personagens com os quais o leitor se identifica
- Conflito claro → jornada → transformação
- Diálogos e cenas vívidas
- Arcos emocionais completos
- "Mostre, não conte"
`,
    'visceral': `
ESTILO: VISCERAL PROVOCATIVO
- Linguagem que atinge o corpo, não só a mente
- Imagens perturbadoras mas verdadeiras
- Confronta crenças limitantes diretamente
- Vulnerabilidade radical como poder
- Quebra todas as convenções quando necessário
- Tom: "Vou te dizer o que ninguém tem coragem"
`,
  };

  return `MODO DE OPERAÇÃO ESTILÍSTICA:\n${styles[style]}`;
}

/**
 * Instruções específicas por tipo de conteúdo
 */
function getContentTypeInstructions(type: ContentType): string {
  const instructions: Record<ContentType, string> = {
    livro: `
TIPO DE CONTEÚDO: LIVRO (250-300 PÁGINAS)

ESTRUTURA OBRIGATÓRIA:
1. PRÓLOGO (opcional mas recomendado) - gancho emocional forte
2. ESTRUTURA EM TEMPORADAS (opcional) - para livros biográficos/cronológicos
3. CAPÍTULOS (mínimo 15, máximo 30)
   - Cada capítulo: 10-15 páginas
   - Abertura forte de capítulo (mini-gancho)
   - Desenvolvimento com tensão crescente
   - Fechamento que cria curiosidade para o próximo
4. SEÇÕES dentro de capítulos
5. MONÓLOGOS ESTRATÉGICOS - para momentos de epifania
6. EPÍLOGO - transformação completa, visão de futuro

CRONOLOGIA:
- NUNCA inventar eventos ou datas
- Manter linha do tempo factual
- Se houver datas conflitantes no material, sinalizar
- Organizar eventos em ordem lógica/temporal

RITMO:
- Alternância entre ação e reflexão
- Capítulos de alta tensão seguidos de respiração
- Construir para clímax nos capítulos finais
`,
    ebook: `
TIPO DE CONTEÚDO: E-BOOK (AUTORIDADE + CONVERSÃO)

OBJETIVO: Estabelecer autoridade e gerar leads/vendas

ESTRUTURA:
1. TÍTULO MAGNÉTICO - promessa clara e irresistível
2. INTRODUÇÃO - problema urgente + solução única
3. CAPÍTULOS (5-10)
   - Cada um entrega valor real
   - Frameworks práticos
   - Casos de estudo
4. CALL TO ACTION a cada 2-3 páginas
5. CONCLUSÃO - próximo passo óbvio

ELEMENTOS ESSENCIAIS:
- Boxes de destaque com insights chave
- Listas e bullet points para escaneabilidade
- "Quick wins" implementáveis
- CTAs suaves mas constantes
- Positioning da autora como autoridade única
`,
    carrossel: `
TIPO DE CONTEÚDO: CARROSSEL / FUNIL VISUAL

OBJETIVO: Parar scroll, construir tensão, converter

ESTRUTURA (8-10 SLIDES):
1. SLIDE 1 - GANCHO
   - Headline impossível de ignorar
   - Quebra de padrão visual
   - Promessa ou curiosidade extrema

2. SLIDES 2-3 - AGITAR DOR / DESPERTAR DESEJO
   - "Você já sentiu...?"
   - "E se eu te dissesse...?"

3. SLIDES 4-6 - ENTREGAR PROMESSA
   - Valor real, não enrolação
   - Revelar "segredos"
   - Construir credibilidade

4. SLIDES 7-8 - PRÓXIMA AÇÃO
   - CTA claro e específico
   - Urgência sutil
   - Benefício final cristalino

CADA SLIDE:
- Máximo 20-30 palavras
- 1 ideia por slide
- Progressão narrativa clara
- Headlines que funcionam sozinhas
`,
    mentoria: `
TIPO DE CONTEÚDO: MENTORIA / PROGRAMA

OBJETIVO: Transformação através de sistema estruturado

ESTRUTURA:
1. VISÃO GERAL DO PROGRAMA
   - Transformação prometida
   - Jornada completa
   - Duração e formato

2. MÓDULOS (4-8)
   Cada módulo tem:
   - Objetivo específico
   - Encontros/aulas (2-4 por módulo)
   - Exercícios práticos
   - Frameworks proprietários
   - Marcos de progresso

3. MATERIAIS DE APOIO
   - Workbooks
   - Templates
   - Checklists
   - Recursos extras

ELEMENTOS:
- Roteiros de encontros prontos para falar
- Exercícios com resultados mensuráveis
- Sistemas/frameworks com nomes memoráveis
- Progression clara: Fundação → Implementação → Maestria
`,
    vsl: `
TIPO DE CONTEÚDO: VSL (VIDEO SALES LETTER)

OBJETIVO: Conversão máxima através de narrativa falada

ESTRUTURA CLÁSSICA:
1. ABERTURA (0-2 min)
   - Gancho + promessa grande
   - "Você está no lugar certo se..."
   - Estabelecer credibilidade rápido

2. HISTÓRIA / NARRATIVA (2-8 min)
   - Jornada da autora
   - "Eu era como você..."
   - Descoberta do método

3. PROVAS (8-12 min)
   - Resultados concretos
   - Depoimentos
   - Demonstração

4. QUEBRAS DE OBJEÇÃO (12-15 min)
   - "Talvez você esteja pensando..."
   - Responder todas as dúvidas

5. OFERTA + CTA (15-20 min)
   - Revelar oferta
   - Bônus e urgência
   - CTA repetido

FORMATO:
- Escrito para FALAR, não ler
- Pausas marcadas: [PAUSA]
- Ênfases marcadas: *PALAVRA*
- Ritmo conversacional
- Quebras de padrão visuais sugeridas
`,
    'video-longo': `
TIPO DE CONTEÚDO: VÍDEO LONGO (YOUTUBE)

OBJETIVO: Engajamento, autoridade, comunidade

ESTRUTURA:
1. HOOK (primeiros 8 segundos)
   - Promessa + curiosidade
   - Visual impactante

2. INTRODUÇÃO (0-1 min)
   - O que será coberto
   - Por que assistir até o fim
   - Pequeno teaser

3. CONTEÚDO PRINCIPAL (dividido em capítulos)
   - Seções claras com subtítulos
   - Progressão lógica
   - Payoffs constantes

4. CONCLUSÃO
   - Recap dos pontos principais
   - Próxima ação
   - CTA para inscrição/comentários

ELEMENTOS:
- Timestamps para cada seção
- Loops abertos para retenção
- "Mais sobre isso em breve..."
- CTAs suaves ao longo do vídeo
`,
    post: `
TIPO DE CONTEÚDO: POST (BLOG/SOCIAL MEDIA)

OBJETIVO: Engajamento rápido, viralização, conversão suave

ESTRUTURA:
1. ABERTURA - gancho forte em 1-2 frases
2. DESENVOLVIMENTO - valor ou história em 3-5 parágrafos
3. FECHAMENTO - reflexão ou CTA

FORMATO:
- Parágrafos curtos (2-3 linhas)
- Espaçamento para respirar
- Emojis estratégicos (se apropriado)
- Quebras de linha para ênfase
- Hashtags relevantes (plataforma social)
`,
    artigo: `
TIPO DE CONTEÚDO: ARTIGO DE AUTORIDADE

OBJETIVO: SEO, autoridade, educação profunda

ESTRUTURA:
1. TÍTULO SEO + MAGNÉTICO
2. INTRODUÇÃO
   - Hook
   - Contexto do problema
   - Promessa do artigo

3. CORPO (H2 e H3 bem estruturados)
   - Subtópicos claros
   - Parágrafos de 3-5 linhas
   - Dados e fontes
   - Exemplos práticos

4. CONCLUSÃO
   - Recap
   - Ação sugerida
   - CTA suave

ELEMENTOS:
- Boxes de destaque
- Listas numeradas/bullets
- Imagens com alt text
- Links internos estratégicos
- Meta description otimizada
`,
  };

  return `INSTRUÇÕES DE CONTEÚDO:\n${instructions[type]}`;
}

/**
 * Instruções específicas por objetivo
 */
function getObjectiveInstructions(objectives: ConversionObjective[]): string {
  const objectiveMap: Record<ConversionObjective, string> = {
    vendas: 'Construir desejo irresistível e urgência genuína. Posicionar a oferta como solução óbvia.',
    engajamento: 'Criar conexão emocional profunda. Provocar comentários, shares, discussões.',
    crescimento: 'Viralização através de valor + emoção. Shareable, memorable, repeatable.',
    reconhecimento: 'Estabelecer autoridade única. Posicionamento como thought leader.',
    lancamento: 'Gerar antecipação e FOMO. Construir expectativa crescente.',
    autoridade: 'Demonstrar expertise profunda. Frameworks únicos, insights originais.',
    leads: 'Oferecer valor imenso. Gerar curiosidade para próximo passo.',
  };

  const selected = objectives.map((obj) => objectiveMap[obj]);

  return `OBJETIVOS DE CONVERSÃO:\n${selected.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
}

/**
 * Prompt de usuário específico por tipo de conteúdo
 */
function getContentTypeUserPrompt(type: ContentType): string {
  const prompts: Record<ContentType, string> = {
    livro: 'Gere uma ESTRUTURA COMPLETA de livro com sumário detalhado, depois o conteúdo de cada capítulo.',
    ebook: 'Gere um e-book completo otimizado para conversão e estabelecimento de autoridade.',
    carrossel: 'Gere um carrossel de 8-10 slides com headlines magnéticas e progressão narrativa.',
    mentoria: 'Gere um programa completo de mentoria com módulos, encontros e exercícios.',
    vsl: 'Gere um roteiro completo de VSL otimizado para conversão máxima.',
    'video-longo': 'Gere um roteiro de vídeo longo com capítulos, timestamps e hooks de retenção.',
    post: 'Gere um post otimizado para engajamento e viralização.',
    artigo: 'Gere um artigo completo otimizado para SEO e autoridade.',
  };

  return prompts[type];
}

/**
 * Gera prompt para análise crítica
 */
export function buildCriticalAnalysisPrompt(
  content: string,
  contentType: ContentType,
  objectives: ConversionObjective[]
): { systemPrompt: string; userPrompt: string } {
  const constitution = getFullConstitution();

  const systemPrompt = `${constitution}

MODO: CRÍTICO ESTRATÉGICO

Sua função agora é ANALISAR E MELHORAR conteúdo existente.
Aplique os módulos de PNL, UCG e Storytelling para identificar:
1. Pontos fracos na persuasão
2. Oportunidades de viralização
3. Lacunas na jornada emocional
4. Melhorias estratégicas específicas

Seja BRUTAL mas CONSTRUTIVO.
Não elogie - MELHORE.
`;

  const userPrompt = `TIPO DE CONTEÚDO: ${contentType}
OBJETIVOS: ${objectives.join(', ')}

CONTEÚDO PARA ANÁLISE:
${content}

TAREFA:
1. Analise o conteúdo usando os princípios da Constituição
2. Identifique exatamente onde e como melhorar
3. Sugira reescritas específicas para seções fracas
4. Proponha adições para maximizar conversão
5. Indique oportunidades de viralização

Formato de resposta:
- Pontos fortes (seja breve)
- Pontos fracos (seja específico)
- Sugestões de melhoria (com exemplos)
- Reescrita sugerida das seções críticas
- Oportunidades de viralização
`;

  return { systemPrompt, userPrompt };
}

/**
 * Gera prompts para direção de arte
 */
export function buildArtDirectionPrompt(
  contentType: ContentType,
  contentSummary: string,
  numImages: number = 1
): string {
  const baseStyle = `Alto Contraste, Paleta: Preto, Dourado, Bege e Branco, Metáforas Sensoriais, Cinematográfico, Profissional`;

  if (contentType === 'carrossel') {
    return `Gere ${numImages} prompts de imagem ultra-profissionais para carrossel Instagram/LinkedIn.

ESTILO BASE: ${baseStyle}

CONTEXTO DO CONTEÚDO:
${contentSummary}

REQUISITOS:
- Cada prompt deve ser específico e detalhado
- Consistência visual entre todos os slides
- Progressão narrativa visual
- Elementos que param o scroll
- Composição profissional

Formato: Array de prompts numerados, um para cada slide.`;
  }

  return `Gere ${numImages} prompt(s) de imagem ultra-profissional(is).

ESTILO BASE: ${baseStyle}

CONTEXTO DO CONTEÚDO:
${contentSummary}

TIPO: ${contentType}

REQUISITOS:
- Prompt extremamente detalhado
- Especificar: composição, iluminação, mood, cores, estilo fotográfico
- Deve ser impossível de ignorar
- Profissional mas impactante
`;
}
