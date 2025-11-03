import { OpenAIProvider } from '../ai/openai-provider';
import { PDFProcessor } from './pdf-processor';

export interface BiographicalAnalysis {
  temasCentrals: string[];
  momentosChave: Array<{
    titulo: string;
    descricao: string;
    impactoEmocional: number;
    transformacao: string;
  }>;
  arcoNarrativo: {
    setup: string;
    pontoDeVirada1: string;
    confronto: string;
    pontoDeVirada2: string;
    climax: string;
    resolucao: string;
  };
  elementosViscerais: Array<{
    momento: string;
    sensacoesFisicas: string[];
    estadoEmocional: string;
    significado: string;
  }>;
  personagens: Array<{
    nome: string;
    relevancia: number;
    relacionamento: string;
    impacto: string;
  }>;
  contextosTemporais: Array<{
    periodo: string;
    eventos: string[];
    atmosfera: string;
  }>;
}

export class BiographicalAnalyzer {
  constructor(
    private openai: OpenAIProvider,
    private pdfProcessor: PDFProcessor
  ) {}

  async analyzeBiography(files: File[]): Promise<BiographicalAnalysis> {
    // Processar PDFs em paralelo
    const textsPromises = files.map(file => this.pdfProcessor.extractText(file));
    const texts = await Promise.all(textsPromises);
    
    // Combinar os textos em ordem cronológica (usando metadados ou padrões no texto)
    const orderedText = await this.orderFragments(texts);
    
    // Análise do conteúdo com estilo "montanha russa visceral"
    const analysis = await this.analyzeContent(orderedText);
    
    return analysis;
  }

  private async callLLM(system: string, user: string): Promise<string> {
    const anyProvider: any = this.openai as unknown as any;
    const content = await anyProvider.request(anyProvider.model, [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]);
    return content as string;
  }

  private async orderFragments(texts: string[]): Promise<string> {
    const completion = await this.callLLM(
      'Organize estes fragmentos de texto em ordem cronológica, identificando padrões temporais, referências a datas e sequência de eventos. Retorne o texto organizado.',
      texts.join('\n---\n')
    );

    return completion;
  }

  private async analyzeContent(text: string): Promise<BiographicalAnalysis> {
    const structurePrompt = `
      Analise este texto biográfico e estruture-o no estilo "montanha russa visceral", identificando:

      1. Temas centrais e fios condutores emocionais
      2. Momentos-chave com maior impacto emocional
      3. Arco narrativo com pontos de tensão crescente
      4. Elementos viscerais (sensações físicas, estados emocionais)
      5. Personagens importantes e seus impactos
      6. Contextos temporais e atmosfera

      Foque em momentos de alta intensidade emocional
      Foque em momentos de alta intensidade emocional
      Identifique padrões de tensão-alívio que podem criar o efeito "montanha russa".

      Retorne um JSON válido seguindo o esquema da interface BiographicalAnalysis.
    `;

    const completion = await this.callLLM(structurePrompt, text);
    const analysis: BiographicalAnalysis = JSON.parse(completion);

    return analysis;
  }
}
