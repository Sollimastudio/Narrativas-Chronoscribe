export type NarrativeTone =
  | "visionary"
  | "educational"
  | "inspirational"
  | "documentary"
  | "sales";

export type NarrativeMedium = "text" | "script" | "audio" | "video";

export interface BlueprintSection {
  id: string;
  title: string;
  objective: string;
  highlights?: string[];
}

export interface NarrativeBlueprint {
  title: string;
  audience: string;
  objective: string;
  medium: NarrativeMedium;
  tone: NarrativeTone;
  lengthGuidance: "short" | "standard" | "longform";
  summary: string;
  callToAction?: string;
  sections: BlueprintSection[];
  linksURLs: string[];
  arquivosPDFs: string;
  arquivosMIdia: string;
  acaoDiretorArte: boolean;
  acaoCritico: boolean;
  numImagensCarrossel?: number;
}

export interface NarrativeGenerationContext {
  blueprint: NarrativeBlueprint;
  brandVoice?: string;
  language: "pt-BR" | "en-US" | "es-ES";
  format: "markdown" | "json" | "text";
}

export interface AnalisePreditiva {
  sugestoesCriticas: string;
  sugestoesViralizacao: string;
}

export interface ContentSection {
  subtitulo?: string;
  texto: string;
}

export interface GeneratedNarrative {
  id: string;
  createdAt: string;
  titulo: string;
  subtitulo?: string;
  tempoLeitura?: number;
  conteudo: ContentSection[];
  promptTokens?: number;
  completionTokens?: number;
  promptImagem?: string;
  promptCarrossel?: string[];
  analisePreditiva?: AnalisePreditiva;
}
