import { GeneratedNarrative } from './blueprint';

// Analytics shape used by StrategicAnalyzer and Exporters
export interface AnalyticsData {
  marketTrends: {
    keywords: string[];
    volumes: Record<string, number>;
    trends: Array<{
      topic: string;
      growth: number;
      relevance: number;
      seasonality: { peak: string[]; low: string[] };
      demographics: { ageGroups: string[]; interests: string[]; locations: string[] };
    }>;
    relatedTopics: string[];
  };
  contentInsights: {
    emotionalScore: number;
    viralPotential: number;
    uniquenessScore: number;
    controversyLevel: number;
    narrativeHooks: string[];
    emotionalTriggers: string[];
    readability: { score: number; level: string; suggestions: string[] };
    engagement: { estimatedReadTime: number; attentionHotspots: string[]; retentionFactors: string[] };
    seoMetrics: { difficulty: number; competition: number; opportunity: number; recommendedLength: number };
  };
  competitiveAnalysis: {
    topPerformers: Array<{
      title: string;
      url: string;
      engagement: number;
      shareCount: number;
      platform: string;
      format: string;
    }>;
    gaps: string[];
    opportunities: string[];
    marketPosition: { saturation: number; uniqueAngles: string[]; barriers: string[] };
  };
  strategyRecommendations: {
    hooks: string[];
    angles: string[];
    distributionChannels: string[];
    timing: { bestDays: string[]; bestTimes: string[]; seasonalOpportunities: string[]; eventAlignment: string[] };
    formatSpecific: { structure: string[]; elements: string[]; style: string[]; examples: string[] };
    distribution: { primary: string[]; secondary: string[]; promotional: { channels: string[]; tactics: string[]; timing: string[] } };
  };
  audienceInsights: {
    segments: string[];
    preferences: string[];
    behaviors: string[];
    painPoints: string[];
  };
}

export type EtapaWorkflow = 
  | 'upload'      // Upload de PDFs e links
  | 'formato'     // Seleção de formato
  | 'estilo'      // Seleção de estilo
  | 'analise'     // Análise do conteúdo
  | 'geracao'     // Geração do conteúdo
  | 'exportacao'; // Exportação e compartilhamento

export interface DadosAnaliticos {
  tendenciasMercado: {
    palavrasChave: string[];
    volumes: Record<string, number>;
    tendencias: Array<{
      topico: string;
      crescimento: number;
      relevancia: number;
      sazonalidade: {
        pico: string[];
        baixa: string[];
      };
      demografia: {
        faixasEtarias: string[];
        interesses: string[];
        localizacoes: string[];
      };
    }>;
    topicosRelacionados: Array<{
      nome: string;
      correlacao: number;
      volumePesquisa: number;
    }>;
  };
  insightsConteudo: {
    pontuacaoEmocional: number;
    potencialViral: number;
    pontuacaoUnicidade: number;
    nivelControversia: number;
    ganchosNarrativos: string[];
    gatilhosEmocionais: string[];
    legibilidade: {
      pontuacao: number;
      nivel: string;
      sugestoes: string[];
    };
    engajamento: {
      tempoEstimadoLeitura: number;
      pontosAtencao: string[];
      fatoresRetencao: string[];
    };
    metricasSEO: {
      dificuldade: number;
      competicao: number;
      oportunidade: number;
      tamanhoRecomendado: number;
    };
  };
  analiseCompetitiva: {
    melhoresPerformances: Array<{
      titulo: string;
      url: string;
      engajamento: number;
      numeroCompartilhamentos: number;
      dataPublicacao: string;
      plataforma: string;
      formato: string;
      pontosFortes: string[];
      pontosFracos: string[];
    }>;
    lacunas: string[];
    oportunidades: string[];
    posicaoMercado: {
      saturacao: number;
      angulosUnicos: string[];
      barreiras: string[];
    };
  };
  recomendacoesEstrategicas: {
    ganchos: string[];
    angulos: string[];
    canaisDistribuicao: string[];
    cronograma: {
      melhoresDias: string[];
      melhoresHorarios: string[];
      oportunidadesSazonais: string[];
      alinhamentoEventos: Array<{
        evento: string;
        data: string;
        relevancia: number;
      }>;
    };
    especificoFormato: {
      estrutura: string[];
      elementos: string[];
      estilo: string[];
      exemplos: string[];
    };
    distribuicao: {
      primarios: string[];
      secundarios: string[];
      promocional: {
        canais: string[];
        taticas: string[];
        cronograma: string[];
      };
    };
  };
  insightsAudiencia: {
    demografia: {
      idade: Record<string, number>;
      interesses: Record<string, number>;
      comportamento: Record<string, number>;
    };
    psicografia: {
      motivacoes: string[];
      pontosDor: string[];
      objetivos: string[];
      valores: string[];
    };
    engajamento: {
      plataformas: Record<string, number>;
      formatos: Record<string, number>;
      horariosPico: Record<string, number>;
    };
  };
}

export interface EstadoWorkflow {
  etapaAtual: EtapaWorkflow;
  etapasConcluidas: EtapaWorkflow[];
  projetoId: string | null;
  dados: {
    arquivos: string[];
    links: string[];
    formato: string | null;
    estilo: string | null;
    analise: DadosAnaliticos | null;
    conteudo: GeneratedNarrative | null;
  };
}

export type AcaoWorkflow =
  | { type: 'DEFINIR_ETAPA'; etapa: EtapaWorkflow }
  | { type: 'COMPLETAR_ETAPA'; etapa: EtapaWorkflow }
  | { type: 'DEFINIR_PROJETO'; projetoId: string }
  | { type: 'ADICIONAR_ARQUIVOS'; arquivos: string[] }
  | { type: 'ADICIONAR_LINKS'; links: string[] }
  | { type: 'DEFINIR_FORMATO'; formato: string }
  | { type: 'DEFINIR_ESTILO'; estilo: string }
  | { type: 'DEFINIR_ANALISE'; analise: DadosAnaliticos }
  | { type: 'DEFINIR_CONTEUDO'; conteudo: GeneratedNarrative }
  | { type: 'RESETAR' };

export const estadoInicialWorkflow: EstadoWorkflow = {
  etapaAtual: 'upload',
  etapasConcluidas: [],
  projetoId: null,
  dados: {
    arquivos: [],
    links: [],
    formato: null,
    estilo: null,
    analise: null,
    conteudo: null,
  },
};

// Alias para compatibilidade
export const initialWorkflowState = estadoInicialWorkflow;
