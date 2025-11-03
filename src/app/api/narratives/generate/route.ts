import { NextRequest, NextResponse } from 'next/server';
import { OpenAIProvider } from '@/server/ai/openai-provider';

const provider = new OpenAIProvider();

export async function POST(req: NextRequest) {
  try {
    const { format, style, analysis } = await req.json();

    if (!format || !style || !analysis) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Gera o conteúdo usando o provider existente
    const systemPrompt = `Você é um especialista em criação de conteúdo profissional.
      Sua tarefa é gerar conteúdo seguindo este formato: ${format}
      E utilizando este estilo de escrita: ${style}`;

    const userPrompt = `Com base na seguinte análise, por favor gere um conteúdo completo e bem estruturado:
      ${JSON.stringify(analysis, null, 2)}`;

    const result = await provider.generate({
      systemPrompt,
      userPrompt,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/narratives/generate]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
