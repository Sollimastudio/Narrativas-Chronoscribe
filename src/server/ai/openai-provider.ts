import { env } from "@/config/env";
import type {
  AnalisePreditiva,
  GeneratedNarrative,
  ContentSection,
} from "@/domain/narratives/blueprint";
import { ProviderError } from "@/utils/errors";

interface OpenAIResponseChoice {
  message?: {
    content?: string | null;
  };
}

interface OpenAIResponse {
  id: string;
  created: number;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  choices?: OpenAIResponseChoice[];
}

export interface KeywordAnalysis {
  keywords: string[];
}

export interface EmotionalAnalysis {
  score: number;
  viralPotential: number;
  uniqueness: number;
  controversy: number;
  hooks: string[];
  triggers: string[];
}

export interface ReadabilityAnalysis {
  score: number;
  level: string;
  improvements: string[];
  readTime: number;
  hotspots: string[];
  retention: string[];
}

export interface SEOAnalysis {
  difficulty: number;
  competition: number;
  opportunity: number;
  recommendedLength: number;
}

export interface ContentStrategy {
  hooks: string[];
  angles: string[];
  channels: string[];
  timing: {
    days: string[];
    hours: string[];
    seasonal: string[];
    events: Array<{
      event: string;
      date: string;
      relevance: number;
    }>;
  };
  format: {
    structure: string[];
    elements: string[];
    style: string[];
    examples: string[];
  };
  distribution: {
    primary: string[];
    secondary: string[];
    promotional: {
      channels: string[];
      tactics: string[];
      timing: string[];
    };
  };
}

export class OpenAIProvider {
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(
    config: {
      baseUrl?: string;
      apiKey?: string;
      model?: string;
    } = {}
  ) {
    this.endpoint = `${config.baseUrl ?? env.openAI.baseUrl}/chat/completions`;
    this.apiKey = config.apiKey ?? env.openAI.apiKey;
    this.model = config.model ?? env.openAI.model;
  }

  async generate({
    systemPrompt,
    userPrompt,
  }: {
    systemPrompt: string;
    userPrompt: string;
  }): Promise<GeneratedNarrative> {
    if (!this.apiKey) {
      console.error('❌ OPENAI_API_KEY não configurada. Configure a variável de ambiente.');
      throw new ProviderError(
        "openai",
        "OPENAI_API_KEY não configurada. Configure a variável de ambiente OPENAI_API_KEY."
      );
    }

    console.log(`🤖 Gerando conteúdo com modelo: ${this.model}`);
    
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        top_p: 0.9,
        presence_penalty: 0.3,
        frequency_penalty: 0.2,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ Erro do OpenAI (${response.status}):`, errorBody);
      throw new ProviderError(
        "openai",
        `Falha na chamada ao modelo (${response.status}): ${errorBody}`
      );
    }

    const data = (await response.json()) as OpenAIResponse;
    const choice = data.choices?.[0];
    const content = choice?.message?.content?.trim();

    if (!content) {
      console.error('❌ OpenAI retornou resposta vazia');
      throw new ProviderError(
        "openai",
        "O modelo não retornou conteúdo textual."
      );
    }

    console.log('✅ Conteúdo gerado com sucesso');
    
    const structured = parseStructuredOutput(content);

    return {
      id: data.id,
      createdAt: new Date((data.created ?? Date.now()) * 1000).toISOString(),
      titulo: structured.titulo || "",
      conteudo: structured.content.map(section => ({
        ...section,
        subtitulo: section.title
      })),
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      promptImagem: structured.promptImagem,
      promptCarrossel: structured.promptCarrossel,
      analisePreditiva: structured.analisePreditiva,
    };
  }

  async analyzeKeywords(content: string): Promise<KeywordAnalysis> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "user",
            content: `Analyze the following content and extract the most important keywords and topics:

Content: ${content}

Return a JSON object with:
1. A list of relevant keywords (max 10)`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new ProviderError(
        "openai",
        `Falha na análise de keywords (${response.status})`
      );
    }

    const data = (await response.json()) as OpenAIResponse;
    const result = data.choices?.[0]?.message?.content;
    return JSON.parse(result || "{}");
  }

  async analyzeEmotionalImpact(content: string): Promise<EmotionalAnalysis> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "user",
            content: `Analyze the emotional impact of the following content:

Content: ${content}

Return a JSON object with:
1. Emotional score (0-1)
2. Viral potential (0-1)
3. Uniqueness score (0-1)
4. Controversy level (0-1)
5. Potential narrative hooks
6. Emotional triggers`,
          },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      throw new ProviderError(
        "openai",
        `Falha na análise emocional (${response.status})`
      );
    }

    const data = (await response.json()) as OpenAIResponse;
    const result = data.choices?.[0]?.message?.content;
    return JSON.parse(result || "{}");
  }

  async analyzeReadability(content: string): Promise<ReadabilityAnalysis> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "user",
            content: `Analyze the readability and engagement of the following content:

Content: ${content}

Return a JSON object with:
1. Readability score (0-100)
2. Reading level
3. Improvement suggestions
4. Estimated read time (minutes)
5. Attention hotspots
6. Retention factors`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new ProviderError(
        "openai",
        `Falha na análise de legibilidade (${response.status})`
      );
    }

    const data = (await response.json()) as OpenAIResponse;
    const result = data.choices?.[0]?.message?.content;
    return JSON.parse(result || "{}");
  }

  async analyzeSEO(content: string): Promise<SEOAnalysis> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "user",
            content: `Analyze the SEO potential of the following content:

Content: ${content}

Return a JSON object with:
1. SEO difficulty (0-100)
2. Competition level (0-100)
3. Opportunity score (0-100)
4. Recommended content length`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new ProviderError(
        "openai",
        `Falha na análise de SEO (${response.status})`
      );
    }

    const data = (await response.json()) as OpenAIResponse;
    const result = data.choices?.[0]?.message?.content;
    return JSON.parse(result || "{}");
  }

  async generateContentStrategy(inputData: {
    content: string;
    format: string;
    marketTrends: any;
    contentInsights: any;
    competitiveAnalysis: any;
    audienceData: any;
  }): Promise<ContentStrategy> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "user",
            content: `Generate a comprehensive content strategy based on the following data:

Content: ${inputData.content}
Format: ${inputData.format}
Market Trends: ${JSON.stringify(inputData.marketTrends)}
Content Insights: ${JSON.stringify(inputData.contentInsights)}
Competitive Analysis: ${JSON.stringify(inputData.competitiveAnalysis)}
Audience Data: ${JSON.stringify(inputData.audienceData)}

Return a JSON object with:
1. Narrative hooks
2. Content angles
3. Distribution channels
4. Timing recommendations
5. Format-specific recommendations
6. Distribution strategy`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new ProviderError(
        "openai",
        `Falha na geração de estratégia (${response.status})`
      );
    }

    const responseData = (await response.json()) as OpenAIResponse;
    const result = responseData.choices?.[0]?.message?.content;
    return JSON.parse(result || "{}");
  }

  async analyzeContent(content: string): Promise<EmotionalAnalysis & ReadabilityAnalysis & SEOAnalysis> {
    const response = await this.request(
      this.model,
      [
        {
          role: 'system',
          content: 'You are an AI assistant for content analysis. Analyze the provided content and return emotional impact, readability, and SEO metrics.'
        },
        {
          role: 'user',
          content: content
        }
      ]
    );

    const result = JSON.parse(response);
    return {
      ...result.emotional,
      ...result.readability,
      ...result.seo
    };
  }

  async analyzeStrategy(data: any): Promise<ContentStrategy> {
    const response = await this.request(
      this.model,
      [
        {
          role: 'system',
          content: 'You are an AI assistant for content strategy. Analyze the provided data and generate strategic recommendations.'
        },
        {
          role: 'user',
          content: JSON.stringify(data)
        }
      ]
    );

    return JSON.parse(response);
  }

  private async request(
    model: string,
    messages: Array<{
      role: string;
      content: string;
    }>
  ): Promise<string> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new ProviderError("OpenAI", response.statusText);
    }

    const data: OpenAIResponse = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new ProviderError("OpenAI", "No content in response");
    }

    return content;
  }
}

export type OpenAINarrativeProvider = OpenAIProvider;

function extractJsonSnippet(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (match?.[1]) {
    return match[1].trim();
  }

  return null;
}

function sanitizeString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function sanitizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const parsed = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item): item is string => item.length > 0);

  return parsed.length > 0 ? parsed : undefined;
}

function parseAnalisePreditiva(value: unknown): AnalisePreditiva | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const criticas = sanitizeString(
    (value as Record<string, unknown>).sugestoesCriticas
  );
  const viralizacao = sanitizeString(
    (value as Record<string, unknown>).sugestoesViralizacao
  );

  if (!criticas && !viralizacao) {
    return undefined;
  }

  return {
    sugestoesCriticas: criticas ?? "",
    sugestoesViralizacao: viralizacao ?? "",
  };
}

function buildContentFromJson(parsed: Record<string, unknown>): string | null {
  const parts: string[] = [];

  const title = sanitizeString(parsed.title);
  if (title) {
    parts.push(title);
  }

  const synopsis = sanitizeString(parsed.synopsis);
  if (synopsis) {
    parts.push(synopsis);
  }

  if (Array.isArray(parsed.sections)) {
    parsed.sections.forEach((section, index) => {
      if (!section || typeof section !== "object") {
        return;
      }

      const sectionTitle =
        sanitizeString((section as Record<string, unknown>).title) ??
        `Seção ${index + 1}`;
      const sectionContent = sanitizeString(
        (section as Record<string, unknown>).content
      );

      const block = sectionContent
        ? `${index + 1}. ${sectionTitle}\n${sectionContent}`
        : `${index + 1}. ${sectionTitle}`;

      parts.push(block);
    });
  }

  const cta = sanitizeString(parsed.cta);
  if (cta) {
    parts.push(`Call to action: ${cta}`);
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.join("\n\n");
}

function parseStructuredOutput(raw: string): {
  titulo: string;
  content: Array<ContentSection & { id?: string; title?: string; objective?: string }>;
  analisePreditiva?: AnalisePreditiva;
  promptImagem?: string;
  promptCarrossel?: string[];
} {
  const snippet = extractJsonSnippet(raw);
  if (!snippet) {
    return {
      titulo: "Sem título",
      content: [{
        id: generateId(),
        title: "Conteúdo principal",
        objective: "Apresentar o conteúdo principal",
        texto: raw
      }]
    };
  }

  try {
    const parsed = JSON.parse(snippet) as Record<string, unknown>;
    const titulo = sanitizeString(parsed.title) || "Sem título";

    let sections: Array<ContentSection & { id: string; title: string; objective: string }> = [];

    if (Array.isArray(parsed.sections)) {
      sections = parsed.sections
        .map((section, index) => {
          if (!section || typeof section !== "object") {
            return null;
          }

          const sectionObj = section as Record<string, unknown>;
          const title = sanitizeString(sectionObj.title);
          const texto = sanitizeString(sectionObj.content);
          const objective = sanitizeString(sectionObj.objective);

          if (!texto) return null;

          return {
            id: generateId(),
            title: title || `Seção ${index + 1}`,
            objective: objective || `Desenvolver a seção ${index + 1}`,
            texto: texto
          };
        })
        .filter((section): section is ContentSection & { id: string; title: string; objective: string } => section !== null);
    }

    // Se não houver seções válidas, criar uma seção com o conteúdo direto
    if (sections.length === 0) {
      const directContent = sanitizeString(parsed.content);
      sections = [{
        id: generateId(),
        title: "Conteúdo principal",
        objective: "Apresentar o conteúdo principal",
        texto: directContent ?? raw
      }];
    }

    return {
      titulo,
      content: sections,
      analisePreditiva: parseAnalisePreditiva(parsed.analisePreditiva),
      promptImagem: sanitizeString(parsed.promptImagem),
      promptCarrossel: sanitizeStringArray(parsed.promptCarrossel),
    };
  } catch (error) {
    console.warn("[openai-provider] não foi possível interpretar JSON:", error);
    return {
      titulo: "Sem título",
      content: [{
        id: generateId(),
        title: "Conteúdo principal",
        objective: "Apresentar o conteúdo principal",
        texto: raw
      }]
    };
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
