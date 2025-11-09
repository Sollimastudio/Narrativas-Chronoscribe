import { NextRequest, NextResponse } from 'next/server';
import { OpenAIProvider } from '@/server/ai/openai-provider';
import {
  buildPersuasiveSystemPrompt,
  buildPersuasiveUserPrompt,
  buildCriticalAnalysisPrompt,
  buildArtDirectionPrompt,
  PromptContext,
} from '@/server/ai/persuasive-prompts';
import type { ContentType, ConversionObjective, NarrativeStyle } from '@/server/ai/constitution';

const provider = new OpenAIProvider();

export const runtime = 'nodejs';

/**
 * API de geração de conteúdo persuasivo usando a Constituição Chronoscribe
 * 
 * Modos:
 * - generate: Gera conteúdo completo
 * - analyze: Análise crítica de conteúdo existente
 * - art: Gera prompts de direção de arte
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, ...rest } = body;

    switch (mode) {
      case 'generate':
        return await handleGenerate(rest);
      case 'analyze':
        return await handleAnalyze(rest);
      case 'art':
        return await handleArt(rest);
      default:
        return NextResponse.json(
          { error: 'Invalid mode. Use: generate, analyze, or art' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[/api/content/persuasive]', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Gera conteúdo persuasivo completo
 */
async function handleGenerate(data: {
  contentType: ContentType;
  objectives: ConversionObjective[];
  style: NarrativeStyle;
  sourceContent: string;
  audience?: string;
  brandVoice?: string;
  additionalContext?: string;
}) {
  const { contentType, objectives, style, sourceContent, audience, brandVoice, additionalContext } = data;

  if (!contentType || !objectives || !style || !sourceContent) {
    return NextResponse.json(
      { error: 'Missing required fields: contentType, objectives, style, sourceContent' },
      { status: 400 }
    );
  }

  const context: PromptContext = {
    contentType,
    objectives,
    style,
    sourceContent,
    audience,
    brandVoice,
    additionalContext,
  };

  const systemPrompt = buildPersuasiveSystemPrompt(context);
  const userPrompt = buildPersuasiveUserPrompt(context);

  console.log('[persuasive/generate] Generating content:', {
    contentType,
    objectives,
    style,
    sourceLength: sourceContent.length,
  });

  try {
    const result = await provider.generate({
      systemPrompt,
      userPrompt,
    });

    return NextResponse.json({
      success: true,
      content: result,
      meta: {
        contentType,
        objectives,
        style,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Modo fallback quando não há API key
    console.warn('[persuasive/generate] Provider failed, using mock mode:', error);
    
    return NextResponse.json({
      success: true,
      content: generateMockContent(contentType, sourceContent),
      meta: {
        contentType,
        objectives,
        style,
        timestamp: new Date().toISOString(),
        mock: true,
        warning: 'Conteúdo gerado em modo simulado. Configure OPENAI_API_KEY para usar geração real.',
      },
    });
  }
}

/**
 * Analisa e sugere melhorias em conteúdo existente
 */
async function handleAnalyze(data: {
  content: string;
  contentType: ContentType;
  objectives: ConversionObjective[];
}) {
  const { content, contentType, objectives } = data;

  if (!content || !contentType || !objectives) {
    return NextResponse.json(
      { error: 'Missing required fields: content, contentType, objectives' },
      { status: 400 }
    );
  }

  const { systemPrompt, userPrompt } = buildCriticalAnalysisPrompt(content, contentType, objectives);

  console.log('[persuasive/analyze] Analyzing content:', {
    contentType,
    objectives,
    contentLength: content.length,
  });

  try {
    const result = await provider.generate({
      systemPrompt,
      userPrompt,
    });

    return NextResponse.json({
      success: true,
      analysis: result,
      meta: {
        contentType,
        objectives,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.warn('[persuasive/analyze] Provider failed, using mock mode:', error);
    
    return NextResponse.json({
      success: true,
      analysis: generateMockAnalysis(contentType),
      meta: {
        contentType,
        objectives,
        timestamp: new Date().toISOString(),
        mock: true,
        warning: 'Análise gerada em modo simulado. Configure OPENAI_API_KEY para usar análise real.',
      },
    });
  }
}

/**
 * Gera prompts de direção de arte
 */
async function handleArt(data: {
  contentType: ContentType;
  contentSummary: string;
  numImages?: number;
}) {
  const { contentType, contentSummary, numImages = 1 } = data;

  if (!contentType || !contentSummary) {
    return NextResponse.json(
      { error: 'Missing required fields: contentType, contentSummary' },
      { status: 400 }
    );
  }

  const prompt = buildArtDirectionPrompt(contentType, contentSummary, numImages);

  console.log('[persuasive/art] Generating art direction:', {
    contentType,
    numImages,
    summaryLength: contentSummary.length,
  });

  try {
    const result = await provider.generate({
      systemPrompt: 'Você é um diretor de arte profissional especializado em criar prompts ultra-detalhados para geração de imagens.',
      userPrompt: prompt,
    });

    return NextResponse.json({
      success: true,
      artDirection: result,
      meta: {
        contentType,
        numImages,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.warn('[persuasive/art] Provider failed, using mock mode:', error);
    
    return NextResponse.json({
      success: true,
      artDirection: generateMockArtDirection(contentType, numImages),
      meta: {
        contentType,
        numImages,
        timestamp: new Date().toISOString(),
        mock: true,
        warning: 'Direção de arte gerada em modo simulado. Configure OPENAI_API_KEY para usar geração real.',
      },
    });
  }
}

/**
 * Gera conteúdo mock para quando não há API key
 */
function generateMockContent(contentType: ContentType, sourceContent: string) {
  const preview = sourceContent.substring(0, 200);
  
  return {
    id: `mock-${Date.now()}`,
    createdAt: new Date().toISOString(),
    titulo: `${contentType.toUpperCase()} Gerado (Modo Simulado)`,
    subtitulo: 'Este é um exemplo de conteúdo. Configure sua API key para geração real.',
    conteudo: [
      {
        subtitulo: 'Introdução',
        texto: `Este é um exemplo de conteúdo gerado no modo simulado.\n\nPara gerar conteúdo real usando a Constituição Chronoscribe, você precisa:\n\n1. Adicionar sua OPENAI_API_KEY no arquivo .env.local\n2. Recarregar a aplicação\n3. Tentar novamente\n\nMaterial base fornecido:\n${preview}...`,
      },
      {
        subtitulo: 'Próximos Passos',
        texto: 'Quando a API key estiver configurada, o sistema usará os módulos de PNL, UCG e Storytelling para criar conteúdo persuasivo de alta qualidade.',
      },
    ],
    promptTokens: 0,
    completionTokens: 0,
  };
}

/**
 * Gera análise mock
 */
function generateMockAnalysis(contentType: ContentType) {
  return {
    id: `mock-analysis-${Date.now()}`,
    createdAt: new Date().toISOString(),
    titulo: 'Análise Crítica (Modo Simulado)',
    conteudo: [
      {
        subtitulo: 'Pontos Fortes',
        texto: '• Estrutura básica presente\n• Conteúdo relevante identificado',
      },
      {
        subtitulo: 'Pontos Fracos',
        texto: '• Para análise real, configure OPENAI_API_KEY\n• Análise profunda requer o motor de IA',
      },
      {
        subtitulo: 'Sugestões',
        texto: `Configure sua chave de API para receber:\n\n• Análise baseada em PNL e UCG\n• Sugestões específicas de viralização\n• Reescritas estratégicas\n• Oportunidades de conversão`,
      },
    ],
  };
}

/**
 * Gera direção de arte mock
 */
function generateMockArtDirection(contentType: ContentType, numImages: number) {
  const mockPrompts = [];
  
  for (let i = 0; i < numImages; i++) {
    mockPrompts.push(`[Imagem ${i + 1}/${numImages}] Prompt profissional seria gerado aqui. Configure OPENAI_API_KEY para receber prompts ultra-detalhados com: composição, iluminação, mood, paleta (Preto, Dourado, Bege, Branco), estilo cinematográfico, e metáforas visuais.`);
  }

  return {
    id: `mock-art-${Date.now()}`,
    createdAt: new Date().toISOString(),
    titulo: 'Direção de Arte (Modo Simulado)',
    prompts: mockPrompts,
    style: 'Alto Contraste, Paleta: Preto, Dourado, Bege e Branco, Metáforas Sensoriais',
  };
}
